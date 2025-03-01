import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
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

    // Extract field values
    const address = fields.address?.[0] || '';
    const city = fields.city?.[0] || '';
    const state = fields.state?.[0] || '';
    const postalCode = fields.postalCode?.[0] || '';
    
    // Optional fields
    const latitudeStr = fields.latitude?.[0];
    const longitudeStr = fields.longitude?.[0];
    
    // Validation
    if (!address || !city || !state || !postalCode) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create base verification data
    const verificationData: any = {
      userId: parseInt(session.user.id as string),
      address,
      city,
      state,
      postalCode,
    };

    // Add optional fields if present
    if (latitudeStr && latitudeStr.trim() !== '') {
      verificationData.latitude = parseFloat(latitudeStr);
    }
    
    if (longitudeStr && longitudeStr.trim() !== '') {
      verificationData.longitude = parseFloat(longitudeStr);
    }

    // Upload files to Cloudinary
    const fileUrls: string[] = [];
    const fileArray = Array.isArray(files.files) ? files.files : [files.files].filter(Boolean);
    
    for (const file of fileArray) {
      if (file && file.filepath) {
        const uploadResponse = await new Promise<any>((resolve, reject) => {
          cloudinary.v2.uploader.upload(
            file.filepath,
            { folder: 'verifications' },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
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

    // Add file URLs to verification data
    verificationData.files = fileUrls;

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