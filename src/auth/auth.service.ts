import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  // In production, these would be stored securely in a database
  private readonly validApiKeys = new Set([
    'test-api-key-1',
    'test-api-key-2',
    'test-api-key-3',
  ]);

  constructor(private readonly jwtService: JwtService) {}

  validateApiKey(apiKey: string): boolean {
    return this.validApiKeys.has(apiKey);
  }

  async validateUser(username: string, password: string): Promise<any> {
    // Mock user validation
    if (username === 'admin' && password === 'admin') {
      return { id: 1, username: 'admin', roles: ['admin'] };
    }
    if (username === 'user' && password === 'password') {
      return { id: 2, username: 'user', roles: ['user'] };
    }
    return null;
  }

  async login(user: any) {
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { 
      sub: user.id, 
      username: user.username,
      roles: user.roles 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        roles: user.roles,
      }
    };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
