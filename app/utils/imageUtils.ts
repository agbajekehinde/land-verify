// imageUtils.ts

import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.js';
GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.js';


export async function preprocessImageForOCR(
    imageBuffer: Buffer, 
    documentType?: 'certificate' | 'id' | 'utility' | 'generic'
): Promise<Buffer> {
    try {
        const metadata = await sharp(imageBuffer).metadata();
        const width = metadata.width || 1000;
        const height = metadata.height || 1000;

        // Start with a basic pipeline
        let pipeline = sharp(imageBuffer);

        // Get image statistics
        const stats = await sharp(imageBuffer).stats();
        const channels = stats.channels;
        
        // Calculate average brightness
        const avgBrightness = channels.reduce((sum, channel) => sum + channel.mean, 0) / channels.length;
        
        // Calculate contrast
        const avgContrast = channels.reduce((sum, channel) => sum + channel.stdev, 0) / channels.length;
        
        console.log(`Image preprocessing - width: ${width}, height: ${height}, brightness: ${avgBrightness.toFixed(2)}, contrast: ${avgContrast.toFixed(2)}, type: ${documentType || 'unspecified'}`);

        // Apply document-type specific optimizations
        if (documentType === 'certificate') {
            pipeline = pipeline
                .normalize()
                .modulate({ brightness: 1.1 })
                .sharpen({ sigma: 1.5 })
                .gamma(0.9);
        } else if (documentType === 'id' || documentType === 'utility') {
            pipeline = pipeline
                .normalize()
                .modulate({ brightness: 1.05, saturation: 0.8 })
                .sharpen({ sigma: 1.2 });
        } else {
            if (avgBrightness < 100) {
                pipeline = pipeline
                    .normalize()
                    .modulate({ brightness: 1.3 })
                    .gamma(1.2)
                    .sharpen();
            } else if (avgBrightness > 220) {
                pipeline = pipeline
                    .normalize()
                    .modulate({ brightness: 0.9 })
                    .gamma(0.8)
                    .sharpen();
            } else if (avgContrast < 15) {
                pipeline = pipeline
                    .normalize()
                    .linear(1.5, -0.15)
                    .sharpen({ sigma: 1.5 });
            } else {
                pipeline = pipeline
                    .normalize()
                    .sharpen({ sigma: 1.0 });
            }
        }

        // Convert to grayscale for better OCR
        pipeline = pipeline.grayscale();

        // Resize if the image is very small
        if (width < 800 || height < 800) {
            const scaleFactor = Math.min(1200 / width, 1200 / height);
            pipeline = pipeline.resize({
                width: Math.round(width * scaleFactor),
                height: Math.round(height * scaleFactor),
                fit: 'fill',
            });
        }

        return await pipeline.toBuffer();
    } catch (error) {
        console.error('Error preprocessing image for OCR:', error);
        return imageBuffer; // Return original if preprocessing fails
    }
}

/**
 * Extract text from PDF documents
 * @param pdfBuffer PDF file as buffer
 * @returns Extracted text
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    try {
        console.log('Extracting text from PDF...');
        
        // Load PDF document
        const data = new Uint8Array(pdfBuffer);
        const loadingTask = pdfjsLib.getDocument({ data });
        const pdf = await loadingTask.promise;
        
        console.log(`PDF loaded: ${pdf.numPages} pages`);
        
        let extractedText = '';
        
        // Process each page
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            
            const pageText = content.items
                .map(item => 'str' in item ? item.str : '')
                .join(' ');
            
            extractedText += pageText + '\n\n';
        }
        
        console.log(`Extracted ${extractedText.length} characters from PDF`);
        return extractedText;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        return '';
    }
}

/**
 * Improved text extraction that handles both images and PDFs
 * @param fileBuffer File buffer to extract text from
 * @param mimeType MIME type of the file
 * @param options Additional options
 * @returns Extracted text
 */
export async function extractTextFromDocument(
    fileBuffer: Buffer,
    mimeType: string,
    options: {
        language?: string,
        whitelist?: string,
        documentType?: 'certificate' | 'id' | 'utility' | 'generic'
    } = {}
): Promise<string> {
    console.log(`Starting text extraction for ${mimeType} document...`);
    
    const { language = 'eng', whitelist, documentType = 'generic' } = options;
    
    try {
        if (mimeType === 'application/pdf') {
            return await extractTextFromPDF(fileBuffer);
        }
        
        if (mimeType.startsWith('image/')) {
            const worker = await createWorker(language);
            
            try {
                console.log('Preprocessing image for OCR...');
                const processedImageBuffer = await preprocessImageForOCR(fileBuffer, documentType);
                console.log('Image preprocessing complete');

                // Set Tesseract parameters
                const params: Record<string, string | boolean | number> = {
                    preserve_interword_spaces: '1',
                    tessjs_create_hocr: false,
                    tessjs_create_tsv: false,
                };

                if (documentType === 'certificate') {
                    params.tessedit_pageseg_mode = '3';
                    params.textord_heavy_noise = '0'; 
                    params.tessedit_char_blacklist = '{}[]<>^\\`~|';
                } else if (documentType === 'id' || documentType === 'utility') {
                    params.tessedit_pageseg_mode = '6';
                    params.textord_heavy_noise = '1';
                } else {
                    params.tessedit_pageseg_mode = '3';
                    params.tessedit_char_blacklist = '|{}[]<>^\\`';
                }

                if (whitelist) {
                    params.tessedit_char_whitelist = whitelist;
                }

                await worker.setParameters(params);
                
                console.log('Starting Tesseract recognition...');
                console.time('ocrRecognition');
                const { data: { text } } = await worker.recognize(processedImageBuffer);
                console.timeEnd('ocrRecognition');
                
                console.log(`OCR complete. Extracted ${text.length} characters`);
                
                if (text.length > 0) {
                    console.log('OCR sample output:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
                } else {
                    console.warn('OCR returned empty text');
                }
                
                await worker.terminate();
                return text;
            } catch (error) {
                console.error('Error in OCR text extraction:', error);
                await worker.terminate();
                return '';
            }
        }
        
        console.warn(`Unsupported file type for text extraction: ${mimeType}`);
        return '';
    } catch (error) {
        console.error('Error extracting text from document:', error);
        return '';
    }
}

/**
 * Updated for completeness - full document text extraction
 * @param fileBuffer File buffer to extract text from
 * @param mimeType MIME type of the file
 * @param options Additional options
 * @returns Extracted text
 */
export async function extractFullTextFromDocument(
    fileBuffer: Buffer,
    mimeType: string,
    options: {
        language?: string,
        documentType?: 'certificate' | 'id' | 'utility' | 'generic'
    } = {}
): Promise<string> {
    try {
        console.log(`Extracting full text from ${mimeType} document...`);
        
        const extractedText = await extractTextFromDocument(fileBuffer, mimeType, options);
        
        if (!extractedText || extractedText.trim().length === 0) {
            console.warn('No text extracted from document');
            return '';
        }
        
        console.log(`Successfully extracted ${extractedText.length} characters from document`);
        console.log('Text sample:', extractedText.substring(0, 200) + (extractedText.length > 200 ? '...' : ''));
        
        return extractedText.trim();
    } catch (error) {
        console.error('Error extracting full text from document:', error);
        return '';
    }
}

// --- OCR Utilities ---

export async function preprocessImage(imageBuffer: Buffer): Promise<Buffer> {
    try {
        const metadata = await sharp(imageBuffer).metadata();
        const width = metadata.width || 1000;
        const height = metadata.height || 1000;

        const stats = await sharp(imageBuffer).stats();
        const channels = stats.channels;
        const isColoredBackground = channels[0].mean < channels[2].mean * 0.8;

        let pipeline = sharp(imageBuffer);

        if (isColoredBackground) {
            console.log('Colored background detected, applying preprocessing');
            pipeline = pipeline
                .normalize()
                .linear(1.5, -0.15)
                .grayscale()
                .threshold(130)
                .sharpen({ sigma: 2.0 });
        } else {
            pipeline = pipeline
                .grayscale()
                .linear(1.3, -0.1)
                .median(1)
                .sharpen({ sigma: 1.5 });
        }

        if (width < 1000 || height < 1000) {
            const scaleFactor = Math.min(1000 / width, 1000 / height);
            pipeline = pipeline.resize({
                width: Math.round(width * scaleFactor),
                height: Math.round(height * scaleFactor),
                fit: 'fill',
            });
        }

        return await pipeline.toBuffer();
    } catch (error) {
        console.error('Error preprocessing image:', error);
        return imageBuffer;
    }
}

export async function extractTextFromImage(
    imageBuffer: Buffer,
    language = 'eng',
    whitelist?: string
): Promise<string> {
    // Create worker with language specified at creation time
    const worker = await createWorker(language);

    try {
        const processedImageBuffer = await preprocessImage(imageBuffer);

        const params: Record<string, string | boolean> = {
            tessedit_pageseg_mode: '6',
            preserve_interword_spaces: '1',
        };

        if (whitelist) {
            params.tessedit_char_whitelist = whitelist;
        }

        await worker.setParameters(params);
        const { data: { text } } = await worker.recognize(processedImageBuffer);
        await worker.terminate();

        return text;
    } catch (error) {
        console.error('Error extracting text:', error);
        await worker.terminate();
        return '';
    }
}

// --- Tampering Detection ---

interface ImageTamperingResult {
    score: number;
    details: {
        blurredRegionsDetected: boolean;
        inconsistentQualityRegions: number;
        suspiciousEdges: boolean;
    };
}

export async function detectImageTampering(imageBuffer: Buffer): Promise<ImageTamperingResult> {
    try {
        const grayscaleBuffer = await sharp(imageBuffer).grayscale().toBuffer();
        const metadata = await sharp(grayscaleBuffer).metadata();
        const { width = 0, height = 0 } = metadata;

        if (!width || !height) throw new Error("Invalid dimensions");

        const { data } = await sharp(grayscaleBuffer).raw().toBuffer({ resolveWithObject: true });
        const { blurredRegions, edgeAnomalies } = detectInconsistentQuality(data, width, height);

        const qualityScore = Math.max(0, 1 - (blurredRegions.length / 10));
        const edgeScore = Math.max(0, 1 - (edgeAnomalies / 20));
        const finalScore = (qualityScore * 0.7) + (edgeScore * 0.3);

        return {
            score: parseFloat(finalScore.toFixed(2)),
            details: {
                blurredRegionsDetected: blurredRegions.length > 0,
                inconsistentQualityRegions: blurredRegions.length,
                suspiciousEdges: edgeAnomalies > 5,
            },
        };
    } catch (error) {
        console.error("Error analyzing image:", error);
        return {
            score: 0.5,
            details: {
                blurredRegionsDetected: false,
                inconsistentQualityRegions: 0,
                suspiciousEdges: false,
            },
        };
    }
}

function detectInconsistentQuality(
    data: Buffer,
    width: number,
    height: number
): { blurredRegions: Array<{ x: number; y: number; size: number }>, edgeAnomalies: number } {
    const regionSize = 32;
    const blurredRegions = [];
    let edgeAnomalies = 0;

    for (let y = 0; y < height - regionSize; y += regionSize) {
        for (let x = 0; x < width - regionSize; x += regionSize) {
            const { variance, edgeStrength } = analyzeRegion(data, x, y, regionSize, width);

            if (variance < 100 && edgeStrength < 10) {
                blurredRegions.push({ x, y, size: regionSize });
            }

            if (x > 0 && y > 0) {
                const edgeDifference = getEdgeDifference(data, x, y, regionSize, width);
                if (edgeDifference > 50) edgeAnomalies++;
            }
        }
    }

    return { blurredRegions, edgeAnomalies };
}

function analyzeRegion(
    data: Buffer,
    startX: number,
    startY: number,
    size: number,
    width: number
): { variance: number; edgeStrength: number } {
    const pixels: number[] = [];
    let edgeStrength = 0;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const idx = (startY + y) * width + (startX + x);
            const pixel = data[idx];
            pixels.push(pixel);

            if (x > 0 && y > 0 && x < size - 1 && y < size - 1) {
                const hDiff = Math.abs(data[idx - 1] - data[idx + 1]);
                const vDiff = Math.abs(data[idx - width] - data[idx + width]);
                edgeStrength += Math.max(hDiff, vDiff);
            }
        }
    }

    const avg = pixels.reduce((sum, p) => sum + p, 0) / pixels.length;
    const variance = pixels.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / pixels.length;

    return {
        variance,
        edgeStrength: edgeStrength / (size * size),
    };
}

function getEdgeDifference(
    data: Buffer,
    x: number,
    y: number,
    size: number,
    width: number
): number {
    let horizontalDiff = 0;
    let verticalDiff = 0;

    for (let i = 0; i < size; i++) {
        const left = data[(y + i) * width + (x - 1)];
        const right = data[(y + i) * width + x];
        horizontalDiff += Math.abs(left - right);

        const top = data[(y - 1) * width + (x + i)];
        const bottom = data[y * width + (x + i)];
        verticalDiff += Math.abs(top - bottom);
    }

    return Math.max(horizontalDiff, verticalDiff) / size;
}