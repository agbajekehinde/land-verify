import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false, // Disable built-in bodyParser for file uploads
  },
};

// Helper function to upload a file to Cloudinary
const uploadToCloudinary = async (filePath: string): Promise<string> => {
  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload(
        filePath,
        {
          resource_type: 'auto', // Auto-detect resource type
          folder: 'verification-reports', // Optional: organize in a folder
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as UploadApiResponse);
        }
      );
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Create a new formidable form instance with proper options
  const form = formidable({
    multiples: true, // Support multiple files
    keepExtensions: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
  });

  try {
    // Parse the form
    const [, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      });

    // Process files
    const uploadedFiles = files.files;
    if (!uploadedFiles) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Convert to array if it's a single file
    const fileArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];

    if (fileArray.length === 0) {
      return res.status(400).json({ error: 'No files found in request' });
    }

    // Upload each file to Cloudinary
    const uploadPromises = fileArray.map(async (file) => {
      try {
        // Make sure the file has a path
        if (!file.filepath) {
          throw new Error('File path is missing');
        }

        // Upload to Cloudinary
        const secureUrl = await uploadToCloudinary(file.filepath);

        // Clean up temporary file
        fs.promises.unlink(file.filepath).catch((err) => {
          console.warn('Error deleting temporary file:', err);
        });

        return secureUrl;
      } catch (err) {
        console.error('Error processing file:', err);
        throw err;
      }
    });

    // Wait for all uploads to complete
    const fileUrls = await Promise.all(uploadPromises);

    // Return success response
    return res.status(200).json({
      success: true,
      fileUrls,
    });
  } catch (error) {
    console.error('File upload handler error:', error);
    return res.status(500).json({
      error: 'Failed to upload files',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
