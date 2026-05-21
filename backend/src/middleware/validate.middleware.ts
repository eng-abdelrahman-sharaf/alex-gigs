import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

/**
 * Express middleware to validate request payloads (body, query, params) using a Zod schema.
 * Re-assigns the parsed output back to request to respect schema transforms.
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};
