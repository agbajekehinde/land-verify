// utils/addressExtraction.ts

import { extractTextFromPDF } from '@/app/utils/imageUtils';

/**
 * Extract full text from a document image without filtering
 * @param imageBuffer The document image buffer
 * @returns The extracted full text or empty string if extraction fails
 */
export async function extractFullTextFromDocument(imageBuffer: Buffer): Promise<string> {
  try {
    console.log('Extracting full text from document...');
    
    // Extract text using the enhanced OCR function
    const extractedText = await extractTextFromPDF(imageBuffer);
    
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

/**
 * Checks if a document text contains the specified user address or address components
 * @param documentText The full text extracted from the document
 * @param userAddress The address provided by the user
 * @returns A matching result with score and details
 */
export function checkDocumentContainsAddress(documentText: string, userAddress: string): {
  score: number;
  details: {
    exactMatch: boolean;
    partialMatches: string[];
    matchedWords: number;
    totalWords: number;
  }
} {
  if (!documentText || !userAddress) {
    return {
      score: 0,
      details: {
        exactMatch: false,
        partialMatches: [],
        matchedWords: 0,
        totalWords: 0
      }
    };
  }
  
  // Normalize text for comparison
  const normalizedDocText = documentText.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const normalizedAddress = userAddress.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Check for exact match (very unlikely, but possible)
  const exactMatch = normalizedDocText.includes(normalizedAddress);
  
  // Split address into components and check for each
  const addressWords = normalizedAddress.split(' ').filter(word => word.length > 1);
  const totalWords = addressWords.length;
  
  // Track which words were found and where
  const foundWords: string[] = [];
  const partialMatches: string[] = [];
  
  // Create a context window function to get surrounding text
  const getTextContext = (text: string, keyword: string, windowSize: number = 50): string => {
    const index = text.indexOf(keyword);
    if (index === -1) return '';
    
    const start = Math.max(0, index - windowSize);
    const end = Math.min(text.length, index + keyword.length + windowSize);
    
    return text.substring(start, end);
  };
  
  // Check for each significant address component
  for (const word of addressWords) {
    if (word.length < 2) continue; // Skip very short words
    
    // Skip common words that might give false positives
    if (['and', 'the', 'or', 'of', 'in', 'at', 'to', 'by'].includes(word)) continue;
    
    if (normalizedDocText.includes(word)) {
      foundWords.push(word);
      
      // Get context around the match for verification
      const context = getTextContext(normalizedDocText, word);
      if (context && !partialMatches.includes(context)) {
        partialMatches.push(context);
      }
    }
  }
  
  // Calculate match score
  // More matched words = higher score, weighted by word length (longer words matter more)
  let weightedMatches = 0;
  let totalWeight = 0;
  
  for (const word of addressWords) {
    // Give more weight to longer words and numbers (they're more specific)
    const weight = Math.min(2, word.length / 3) * (/\d/.test(word) ? 1.5 : 1);
    totalWeight += weight;
    
    if (foundWords.includes(word)) {
      weightedMatches += weight;
    }
  }
  
  let score = totalWeight > 0 ? weightedMatches / totalWeight : 0;
  
  // Boost score if multiple adjacent words are found
  if (partialMatches.some(match => {
    // Check if any match contains 2+ consecutive address words
    let consecutiveCount = 0;
    for (const word of addressWords) {
      if (match.includes(word)) {
        consecutiveCount++;
        if (consecutiveCount >= 2) return true;
      } else {
        consecutiveCount = 0;
      }
    }
    return false;
  })) {
    score = Math.min(1, score * 1.3); // 30% boost for consecutive words
  }
  
  // Ensure reasonable score range
  score = Math.min(1, Math.max(0, score));
  
  return {
    score: parseFloat(score.toFixed(2)),
    details: {
      exactMatch,
      partialMatches,
      matchedWords: foundWords.length,
      totalWords
    }
  };
}