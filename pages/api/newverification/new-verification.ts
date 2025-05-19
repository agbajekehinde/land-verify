// pages/api/new-verification.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient, Prisma } from "@prisma/client";
import { detectImageTampering } from '@/app/utils/imageUtils';
import { checkDocumentContainsAddress } from '@/app/utils/addressExtraction';
import { extractFullTextFromDocument } from '@/app/utils/imageUtils';
import cloudinary from "cloudinary";
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Define types 
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: unknown;
}

interface DocumentIntegrityResult {
  overallScore: number;
  imageAnalysis: {
    score: number;
    details: Array<{
      filename: string;
      result: {
        score: number;
        details?: {
          blurredRegionsDetected: boolean;
          inconsistentQualityRegions: number;
          suspiciousEdges: boolean;
        }
      };
    }>;
  };
  addressMatching: {
    score: number;
    details: {
      exactMatch: boolean;
      normalizedMatch: boolean;
      tokenMatchScore: number;
    };
    extractedAddress: string;
    extractionConfidence: number;
    matchDetails: {
      matchedWords: number;
      totalWords: number;
      partialMatches: string[];
    };
  };
}

interface ImageAnalysisItem {
  filename: string;
  result: {
    score: number;
    details?: {
      blurredRegionsDetected: boolean;
      inconsistentQualityRegions: number; 
      suspiciousEdges: boolean;
    }
  };
}

// Disable the default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Prisma
const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Utility to get allowed file types
const getAllowedFileTypes = (): string[] => [
  'image/jpeg',
  'image/png', 
  'application/pdf'
];

// ...existing code...
/**
 * Analyzes document integrity and performs full-text matching against user address
 * @param files Array of uploaded files
 * @param userAddress Address provided by user
 * @returns Document integrity analysis results
 */
async function analyzeDocumentIntegrity(
  files: formidable.File[], 
  userAddress: string
): Promise<DocumentIntegrityResult> {
  const imageAnalysisResults: ImageAnalysisItem[] = [];
  let bestMatchScore = 0;
  let bestMatchDetails = {
    exactMatch: false,
    partialMatches: [] as string[],
    matchedWords: 0,
    totalWords: 0
  };
  let bestExtractedText = '';
  
  console.log(`Analyzing ${files.length} files for integrity and address matching`);
  console.log(`User provided address: "${userAddress}"`);
  
  // Process each file
  for (const file of files) {
    if (!file || !file.filepath) continue;
    
    try {
      const fileMimeType = file.mimetype || '';
      const filename = file.originalFilename || 'unknown';
      
      console.log(`Processing file: ${filename} (${fileMimeType})`);
      
      // For supported files, perform analysis
      if (fileMimeType.startsWith('image/') || fileMimeType === 'application/pdf') {
        const fileBuffer = fs.readFileSync(file.filepath);
        
        // Check for image tampering if it's an image
        if (fileMimeType.startsWith('image/')) {
          const analysisResult = await detectImageTampering(fileBuffer);
          
          imageAnalysisResults.push({
            filename: filename,
            result: analysisResult
          });
        }
        
        // Extract full text from document
        console.log(`Extracting text from ${filename}...`);
        try {
          // Use our new full text extraction function
          const extractedText = await extractFullTextFromDocument(fileBuffer, fileMimeType);
          
          if (extractedText && extractedText.trim().length > 0) {
            console.log(`Extracted ${extractedText.length} characters from ${filename}`);
            
            // Check if document contains the address using full-text matching
            const matchResult = checkDocumentContainsAddress(extractedText, userAddress);
            console.log(`Address match score: ${matchResult.score} (matched ${matchResult.details.matchedWords}/${matchResult.details.totalWords} words)`);
            
            // If this is our best match so far, save it
            if (matchResult.score > bestMatchScore) {
              bestMatchScore = matchResult.score;
              bestMatchDetails = matchResult.details;
              bestExtractedText = extractedText;
              
              console.log(`New best match in ${filename} with score ${bestMatchScore}`);
              if (matchResult.details.partialMatches.length > 0) {
                console.log('Matching contexts:');
                matchResult.details.partialMatches.forEach((match, i) => {
                  console.log(`  ${i+1}. "${match}"`);
                });
              }
            }
          } else {
            console.log(`No text extracted from ${filename}`);
          }
        } catch (extractError) {
          console.error(`Error extracting text from ${filename}:`, extractError);
        }
      }
    } catch (err) {
      console.error(`Error processing file ${file.originalFilename}:`, err);
    }
  }
  
  // Calculate overall image integrity score if we have results
  let imageIntegrityScore = 1.0;
  if (imageAnalysisResults.length > 0) {
    imageIntegrityScore = imageAnalysisResults.reduce(
      (sum, item) => sum + item.result.score, 0
    ) / imageAnalysisResults.length;
  }
  
  // Calculate final results
  // For address matching, use our best match score
  const addressMatchResult = {
    score: bestMatchScore,
    details: {
      exactMatch: bestMatchDetails.exactMatch,
      normalizedMatch: bestMatchScore > 0.8, // Consider high scores as normalized matches
      tokenMatchScore: bestMatchScore
    }
  };
  
  // Calculate overall integrity score
  // Balance between image integrity and address matching
  const addressWeight = bestMatchScore > 0 ? 0.5 : 0;
  const imageWeight = 1 - addressWeight;
  
  const overallScore = (imageIntegrityScore * imageWeight) + (bestMatchScore * addressWeight);
  
  // Prepare the final result
  return {
    overallScore: parseFloat(overallScore.toFixed(2)),
    imageAnalysis: {
      score: parseFloat(imageIntegrityScore.toFixed(2)),
      details: imageAnalysisResults
    },
    addressMatching: {
      ...addressMatchResult,
      extractedAddress: bestExtractedText.substring(0, 200) + (bestExtractedText.length > 200 ? '...' : ''),
      extractionConfidence: bestMatchScore,
      matchDetails: {
        matchedWords: bestMatchDetails.matchedWords,
        totalWords: bestMatchDetails.totalWords,
        partialMatches: bestMatchDetails.partialMatches.slice(0, 3) // Include up to 3 matching contexts
      }
    }
  };
}

/**
 * Handles file uploads to Cloudinary
 * @param files Array of files to upload
 * @returns Array of secure URLs for uploaded files
 */
async function uploadFilesToCloudinary(files: formidable.File[]): Promise<string[]> {
  const fileUrls: string[] = [];
  const allowedTypes = getAllowedFileTypes();
  
  for (const file of files) {
    if (!file || !file.filepath) continue;
    
    // Check if file type is allowed
    if (!allowedTypes.includes(file.mimetype || '')) {
      console.warn(`Skipping upload of unsupported file type: ${file.mimetype}`);
      continue;
    }
    
    try {
      // Determine resource_type based on file mimetype
      const resourceType = file.mimetype?.startsWith('image/') 
        ? 'image' 
        : 'raw'; // Use 'raw' for documents like PDF
      
      const uploadResponse = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
        cloudinary.v2.uploader.upload(
          file.filepath,
          { 
            folder: 'verifications',
            resource_type: resourceType
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as CloudinaryUploadResponse);
          }
        );
      });
      
      if (uploadResponse && uploadResponse.secure_url) {
        fileUrls.push(uploadResponse.secure_url);
      }
    } catch (uploadError) {
      console.error(`Error uploading file ${file.originalFilename}:`, uploadError);
    } finally {
      // Clean up temp file regardless of success/failure
      try {
        if (fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
        }
      } catch (cleanupError) {
        console.error(`Error cleaning up temp file ${file.filepath}:`, cleanupError);
      }
    }
  }
  
  return fileUrls;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Configure formidable for file uploads
    const form = formidable({ 
      multiples: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
      // Create temp directory if it doesn't exist
      uploadDir: path.join(process.cwd(), 'tmp'),
      filter: (part) => {
        // Accept all parts that aren't files, or files with allowed types
        if (!part.originalFilename) return true;
        return getAllowedFileTypes().includes(part.mimetype || '');
      }
    });
    
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Parse the form data
    const [fields, filesObj] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });
    
    // Convert the files object to an array
    const fileArray: formidable.File[] = [];
    
    // Handle files - formidable can return either an array or a single file
    Object.values(filesObj).forEach(fileOrFiles => {
      if (Array.isArray(fileOrFiles)) {
        fileArray.push(...fileOrFiles);
      } else if (fileOrFiles) {
        fileArray.push(fileOrFiles);
      }
    });

    const getFieldValue = (field: unknown): string => {
      if (Array.isArray(field)) return field[0] as string;
      return (field as string) || '';
    };

    // Extract field values
    const address = getFieldValue(fields.address);
    const lga = getFieldValue(fields.lga);
    const state = getFieldValue(fields.state);
    const paymentType = getFieldValue(fields.paymentType) || 'regular'; 
    const paymentStatus = getFieldValue(fields.paymentStatus) || 'success'; 
    const paymentAmount = getFieldValue(fields.paymentAmount) || '0';
    
    // Optional fields
    const latitudeStr = getFieldValue(fields.latitude) || '0';
    const landsize = getFieldValue(fields.landsize) || '0'; 
    const longitudeStr = getFieldValue(fields.longitude) || '0';
    
    // Input validation
    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }
    
    if (!lga) {
      return res.status(400).json({ message: 'LGA is required' });
    }
    
    if (!state) {
      return res.status(400).json({ message: 'State is required' });
    }
    
    if (!landsize) {
      return res.status(400).json({ message: 'Land size is required' });
    }
    
    // Parse latitude and longitude
    const latitude = parseFloat(latitudeStr);
    const longitude = parseFloat(longitudeStr);
    
    // Document integrity analysis only if files are provided
    let documentIntegrity: DocumentIntegrityResult;
    let fileUrls: string[] = [];
    
    if (fileArray.length > 0) {
      // Run document integrity analysis with address extraction
      console.log('Starting document integrity analysis...');
      console.time('documentIntegrityAnalysis');
      documentIntegrity = await analyzeDocumentIntegrity(fileArray, address);
      console.timeEnd('documentIntegrityAnalysis');
      
      // Upload files to Cloudinary
      console.log('Uploading files to Cloudinary...');
      fileUrls = await uploadFilesToCloudinary(fileArray);
      console.log(`Uploaded ${fileUrls.length} files to Cloudinary`);
    } else {
      // Default values when no files are provided
      documentIntegrity = {
        overallScore: 0,
        imageAnalysis: {
          score: 0,
          details: []
        },
        addressMatching: {
          score: 0,
          details: {
            exactMatch: false,
            normalizedMatch: false,
            tokenMatchScore: 0
          },
          extractedAddress: '',
          extractionConfidence: 0,
          matchDetails: {
            matchedWords: 0,
            totalWords: 0,
            partialMatches: []
          }
        }
      };
    }
    
    // Prepare verification data
    const verificationData: Prisma.VerificationRequestCreateInput = {
      user: {
        connect: {
          id: parseInt(session.user.id as string, 10)
        }
      },
      address,
      lga,
      state,
      landsize,
      latitude: isNaN(latitude) ? 0 : latitude,
      longitude: isNaN(longitude) ? 0 : longitude,
      paymentType, 
      paymentStatus,
      paymentAmount: parseFloat(paymentAmount),
      documentIntegrity: documentIntegrity as unknown as Prisma.InputJsonValue, // Changed from 'any'
      files: fileUrls,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Create verification record in database
    console.log('Creating verification record in database...');
    const newVerification = await prisma.verificationRequest.create({
      data: verificationData
    });
    
    // Return success response
    return res.status(200).json({
      message: 'Verification request submitted successfully',
      verificationId: newVerification.id,
      documentIntegrity,
      fileCount: fileUrls.length
    });
    
  } catch (error) {
    console.error('Error submitting verification:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({ 
        message: 'Database error', 
        error: error.message,
        code: error.code
      });
    }
    
    return res.status(500).json({ 
      message: 'Internal server error', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}