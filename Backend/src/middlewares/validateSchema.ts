import { Request, Response, NextFunction } from 'express';
import { ZodObject } from 'zod';

export const validateSchema = (schema: ZodObject<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    schema.parse(req.body);
    next();
  };
};