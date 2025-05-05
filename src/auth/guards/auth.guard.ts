import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    
    // First, try JWT authentication
    const token = this.extractJwtToken(request);
    if (token) {
      try {
        const payload = this.jwtService.verify(token);
        request.user = payload;
        return true;
      } catch (error) {
        // JWT is invalid, continue to try API key
      }
    }
    
    // Then, try API key authentication
    const apiKeyHeaderName = this.configService.get('API_KEY_HEADER_NAME', 'x-api-key');
    const apiKey = request.headers[apiKeyHeaderName.toLowerCase()];
    
    if (apiKey && this.authService.validateApiKey(apiKey)) {
      request.user = { apiKey: true };
      return true;
    }
    
    // No valid authentication found
    throw new UnauthorizedException('Invalid authentication credentials');
  }
  
  private extractJwtToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }
    
    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      return null;
    }
    
    return token;
  }
}
