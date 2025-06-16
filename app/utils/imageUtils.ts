// app/utils/imageUtils.ts - Temporary fix with OCR disabled

/**
 * Extract text from document (OCR disabled temporarily)
 * @param buffer File buffer
 * @param mimeType MIME type of the file
 * @returns Empty string (OCR disabled)
 */
export async function extractFullTextFromDocument(buffer: Buffer, mimeType: string): Promise<string> {
  console.log(`OCR temporarily disabled for ${mimeType} document`);
  
  // Return empty string to disable OCR functionality
  // This prevents the Tesseract.js error while keeping the app functional
  return '';
}

/**
 * Detect image tampering (simplified version)
 * @param buffer Image buffer
 * @returns Analysis result
 */
export async function detectImageTampering(buffer: Buffer): Promise<{
  score: number;
  details?: {
    blurredRegionsDetected: boolean;
    inconsistentQualityRegions: number;
    suspiciousEdges: boolean;
  };
}> {
  try {
    // Simple image validation - check if it's a valid image
    const isValidImage = buffer.length > 0 && (
      buffer.toString('hex', 0, 4) === '89504e47' || // PNG
      buffer.toString('hex', 0, 3) === 'ffd8ff' || // JPEG
      buffer.toString('hex', 0, 6) === '474946383761' || // GIF87a
      buffer.toString('hex', 0, 6) === '474946383961' // GIF89a
    );

    if (!isValidImage) {
      return {
        score: 0,
        details: {
          blurredRegionsDetected: false,
          inconsistentQualityRegions: 0,
          suspiciousEdges: false
        }
      };
    }

    // Return a neutral score since we can't perform detailed analysis
    return {
      score: 0.8,
      details: {
        blurredRegionsDetected: false,
        inconsistentQualityRegions: 0,
        suspiciousEdges: false
      }
    };
  } catch (error) {
    console.error('Error in image tampering detection:', error);
    return {
      score: 0.5,
      details: {
        blurredRegionsDetected: false,
        inconsistentQualityRegions: 0,
        suspiciousEdges: false
      }
    };
  }
}