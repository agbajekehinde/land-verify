import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient, Prisma } from "@prisma/client";
import cloudinary from "cloudinary";
import formidable from 'formidable';
import fs from 'fs';

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

// Define type for Cloudinary upload response
interface CloudinaryUploadResponse {
  secure_url: string;
  [key: string]: unknown;
}

// Function to check if file type is allowed
const isAllowedFileType = (file: formidable.File): boolean => {
  const allowedTypes = [
    'image/jpeg', 
    'image/png', 
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword' // .doc
  ];
  
  return allowedTypes.includes(file.mimetype || '');
};

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
    
    const form = formidable({ multiples: true });
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });
    
     // Log parsed fields and files
     console.log('Parsed fields:', fields);
     console.log('Parsed files:', files);

     const getFieldValue = (field: unknown): string => {
      if (Array.isArray(field)) return field[0] as string;
      return (field as string) || '';
    };

    // Extract field values
    const address = getFieldValue(fields.address);
    const lga = getFieldValue(fields.lga);
    const state = getFieldValue(fields.state);
    const landsize = getFieldValue(fields.landsize);
    const paymentType = getFieldValue(fields.paymentType) || 'regular'; 
    const paymentStatus = getFieldValue(fields.paymentStatus) || 'success'; 
    const paymentAmount = getFieldValue(fields.paymentAmount) || '0';
    
    // Optional fields
    const latitudeStr = getFieldValue(fields.latitude) || '0';
    const longitudeStr = getFieldValue(fields.longitude) || '0';
    
    // Validation
    if (!address || !lga || !state || !landsize) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Parse latitude and longitude
    const latitude = parseFloat(latitudeStr);
    const longitude = parseFloat(longitudeStr);
    
    // Create verification data with all required fields
    const verificationData: Prisma.VerificationRequestCreateInput & { paymentType?: string, paymentAmount?: number, paymentStatus?: string } = {
      user: {
        connect: {
          id: parseInt(session.user.id as string, 10)
        }
      },
      address,
      lga,
      state,
      landsize,
      latitude,
      longitude,
      paymentType, 
      paymentStatus,       
      paymentAmount: parseFloat(paymentAmount),
    };
    
    
    // Upload files to Cloudinary
    const fileUrls: string[] = [];

    // Normalize files to an array, even if there's only one file
    const fileArray = Array.isArray(files.files) ? files.files : files.files ? [files.files] : [];
    
    for (const file of fileArray) {
      if (file && file.filepath) {
        // Log file details before upload
        console.log('Uploading file:', file);

        // Check if file type is allowed
        if (!isAllowedFileType(file)) {
          console.warn(`Skipping upload of unsupported file type: ${file.mimetype}`);
          continue;
        }
        
        try {
          // Determine resource_type based on file mimetype
          const resourceType = file.mimetype?.startsWith('image/') 
            ? 'image' 
            : 'raw'; // Use 'raw' for documents like PDF and DOCX
          
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
          // Continue with other files instead of failing completely
        } finally {
          // Clean up temp file regardless of success/failure
          if (fs.existsSync(file.filepath)) {
            fs.unlinkSync(file.filepath);
          }
        }
      }
    }
    
    // Add file URLs to verification data if any files were uploaded
    if (fileUrls.length > 0) {
      verificationData.files = fileUrls;
    }
    
    // Create verification in database
    const newVerification = await prisma.verificationRequest.create({
      data: verificationData
    });
    
    return res.status(200).json({
      message: 'Verification request submitted',
      verification: newVerification
    });
    
  } catch (error) {
    console.error('Error submitting verification:', error);
    return res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : String(error) });
  }
}