import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends NextApiRequest {
  apiKey?: {
    id: string;
    key: string;
    name: string;
    active: boolean;
  };
}

/**
 * Validates API key from request headers
 * @param apiKey - The API key from request headers
 * @returns Promise<boolean> - True if valid, false otherwise
 */
export async function verifyApiKey(apiKey: string | string[] | undefined): Promise<boolean> {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  try {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { 
        key: apiKey,
        active: true 
      }
    });
    
    return !!keyRecord;
  } catch (error) {
    console.error('Error verifying API key:', error);
    return false;
  }
}

/**
 * Gets API key details from database
 * @param apiKey - The API key from request headers
 * @returns Promise<ApiKey | null> - API key record or null if not found
 */
export async function getApiKeyDetails(apiKey: string | string[] | undefined) {
  if (!apiKey || typeof apiKey !== 'string') {
    return null;
  }

  try {
    const keyRecord = await prisma.apiKey.findUnique({
      where: { 
        key: apiKey,
        active: true 
      }
    });
    
    return keyRecord;
  } catch (error) {
    console.error('Error getting API key details:', error);
    return null;
  }
}

/**
 * Middleware to authenticate API requests using API keys
 * @param handler - The API route handler function
 * @returns Function - Wrapped handler with authentication
 */
export function withApiKeyAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    // Check if API key is provided
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ 
        error: 'API key is required',
        message: 'Please provide an API key in the x-api-key header'
      });
    }

    // Verify API key
    const isValid = await verifyApiKey(apiKey);
    if (!isValid) {
      return res.status(401).json({ 
        error: 'Invalid API key',
        message: 'The provided API key is invalid or inactive'
      });
    }

    // Get API key details and attach to request
    const keyDetails = await getApiKeyDetails(apiKey);
    if (keyDetails) {
      req.apiKey = keyDetails;
    }

    // Call the original handler
    return handler(req, res);
  };
}

/**
 * Rate limiting utility (basic implementation)
 * You can enhance this with Redis or other caching solutions
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(apiKey: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const key = `rate_limit:${apiKey}`;
  
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    // Reset or initialize rate limit
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count++;
  return true;
}

/**
 * Rate limiting middleware
 * @param limit - Maximum requests per window
 * @param windowMs - Time window in milliseconds
 */
export function withRateLimit(limit: number = 100, windowMs: number = 60000) {
  return function(handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>) {
    return async (req: AuthenticatedRequest, res: NextApiResponse) => {
      const apiKey = req.headers['x-api-key'] as string;
      
      if (!checkRateLimit(apiKey, limit, windowMs)) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          message: `Too many requests. Limit: ${limit} requests per ${windowMs / 1000} seconds`
        });
      }
      
      return handler(req, res);
    };
  };
} 