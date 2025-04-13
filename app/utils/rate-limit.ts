// utils/rate-limit.ts
import { NextApiResponse } from 'next';
import { LRUCache } from 'lru-cache';

type Options = {
  interval: number;
  uniqueTokenPerInterval: number;
  limit: number;
};

export function rateLimit({ interval, uniqueTokenPerInterval, limit }: Options) {
  const tokenCache = new LRUCache<string, number[]>({
    max: uniqueTokenPerInterval,
    ttl: interval,
  });

  return {
    check: (res: NextApiResponse, token: string, limitCount: number = limit) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [];
        if (tokenCount.length >= limitCount) {
          res.setHeader('X-RateLimit-Limit', limitCount);
          res.setHeader('X-RateLimit-Remaining', 0);
          res.setHeader('Retry-After', Math.ceil(interval / 1000));
          return reject();
        }

        // Add timestamp for this request and update the cache
        tokenCount.push(Date.now());
        tokenCache.set(token, tokenCount);
        
        // Set headers
        res.setHeader('X-RateLimit-Limit', limitCount);
        res.setHeader('X-RateLimit-Remaining', limitCount - tokenCount.length);
        
        resolve();
      }),
  };
}
//               value={password}
