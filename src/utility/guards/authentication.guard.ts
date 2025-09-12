import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user = request.currentUser; 

    if (!user) {
      throw new UnauthorizedException('You are not logged in!');
    }

    return true; 
  }
}
