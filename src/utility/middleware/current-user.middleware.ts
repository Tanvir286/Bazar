import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { AuthService } from 'src/auth/auth.service';
import type { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      currentUser?: Partial<User> | null;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(
    req: Request & { currentUser?: Partial<User> | null },
    res: Response,
    next: NextFunction,
  ) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.currentUser = null;
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verify(token, process.env.JWT_SECRET!) as unknown as {
        sub: number;
        email: string;
        role: string;
      };

      const currentUser = await this.authService.findOne(Number(decoded.sub));
      req.currentUser = currentUser;
    } catch (error) {
      req.currentUser = null;
    }

    next();
  }
}
