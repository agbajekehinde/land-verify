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
    
    // Parse form data with formidable
    const form = formidable({ multiples: true });
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });
    
    // Helper function to extract field values whether they are strings or arrays
    const getFieldValue = (field: unknown): string => {
      if (Array.isArray(field)) return field[0] as string;
      return (field as string) || '';
    };

    // Extract field values
    const address = getFieldValue(fields.address);
    const city = getFieldValue(fields.city);
    const state = getFieldValue(fields.state);
    const postalCode = getFieldValue(fields.postalCode);
    const landsize = getFieldValue(fields.landsize);
    
    // Optional fields
    const latitudeStr = getFieldValue(fields.latitude) || '0'; // Default to 0 if not provided
    const longitudeStr = getFieldValue(fields.longitude) || '0'; // Default to 0 if not provided
    
    // Validation
    if (!address || !city || !state || !landsize) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Parse latitude and longitude
    const latitude = parseFloat(latitudeStr);
    const longitude = parseFloat(longitudeStr);
    
    // Create verification data with all required fields
    const verificationData: Prisma.VerificationRequestCreateInput = {
      user: {
        connect: {
          id: parseInt(session.user.id as string, 10)
        }
      },
      address,
      city,
      state,
      landsize,
      postalCode,
      latitude,
      longitude,
    };
    
    // Upload files to Cloudinary
    const fileUrls: string[] = [];
    const fileArray = Array.isArray(files.files) ? files.files : [files.files].filter(Boolean);
    
    for (const file of fileArray) {
      if (file && file.filepath) {
        const uploadResponse = await new Promise<CloudinaryUploadResponse>((resolve, reject) => {
          cloudinary.v2.uploader.upload(
            file.filepath,
            { folder: 'verifications' },
            (error, result) => {
              if (error) reject(error);
              resolve(result as CloudinaryUploadResponse);
            }
          );
        });
        
        if (uploadResponse && uploadResponse.secure_url) {
          fileUrls.push(uploadResponse.secure_url);
          // Clean up temp file
          fs.unlinkSync(file.filepath);
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
    return res.status(500).json({ message: 'Internal server error' });
  }
}
