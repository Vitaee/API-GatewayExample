import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
  

@Injectable()
export class ApiKeyGuard implements CanActivate {
constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
) {}

async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const key = req.headers[this.config.get('API_KEY_HEADER_NAME', 'x-api-key')];
    if (!key || !(this.authService.validateApiKey(key))) {
    throw new UnauthorizedException('Invalid API Key');
    }
    return true;
}
}

