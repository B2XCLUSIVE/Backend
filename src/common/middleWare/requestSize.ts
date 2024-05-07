import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestSizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const contentLength = req.headers['content-length'];

    if (contentLength) {
      const payloadSize = parseInt(contentLength, 10);
      if (!isNaN(payloadSize)) {
        console.log('Payload Size:', payloadSize);
        res.setHeader('X-Payload-Size', payloadSize);
      } else {
        console.log('Invalid content-length:', contentLength);
      }
    } else {
      console.log('No content-length header found');
    }

    next();
  }
}
