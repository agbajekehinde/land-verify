// pages/api/new-verification.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient, Prisma } from "@prisma/client";
import cloudinary from "cloudinary";
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Define types 
interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: unknown;
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

// Get the appropriate temp directory for the environment
const getTempDir = (): string => {
  // In Vercel/serverless environments, use /tmp
  // In local development, use os.tmpdir() or create a temp directory
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return '/tmp';
  }
  
  const projectTmp = path.join(process.cwd(), 'tmp');
  try {
    if (!fs.existsSync(projectTmp)) {
      fs.mkdirSync(projectTmp, { recursive: true });
    }
    return projectTmp;
  } catch (error) {
    console.warn('Could not create project tmp directory, using system temp:', error);
    return os.tmpdir();
  }
};



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
    
    // Get the appropriate temp directory
    const uploadDir = getTempDir();
    
    // Configure formidable for file uploads
    const form = formidable({ 
      multiples: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
      uploadDir: uploadDir, // Use the determined temp directory
      filter: (part) => {
        // Accept all parts that aren't files, or files with allowed types
        if (!part.originalFilename) return true;
        return getAllowedFileTypes().includes(part.mimetype || '');
      }
    });
    
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
    
    let fileUrls: string[] = [];
    
    if (fileArray.length > 0) {

      // Upload files to Cloudinary
      console.log('Uploading files to Cloudinary...');
      fileUrls = await uploadFilesToCloudinary(fileArray);
      console.log(`Uploaded ${fileUrls.length} files to Cloudinary`);
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