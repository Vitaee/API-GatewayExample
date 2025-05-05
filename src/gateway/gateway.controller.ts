import {
  Controller,
  All,
  Req,
  Res,
  Next,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { GatewayService } from './gateway.service';


@ApiTags('gateway')
@Controller()
export class GatewayController {
  private readonly logger = new Logger(GatewayController.name);

  constructor(private readonly gatewayService: GatewayService) {}

  @All('*')
  async handleRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    try {
      // Skip non-API routes
      if (!req.url.startsWith('/users') && 
          !req.url.startsWith('/products') && 
          !req.url.startsWith('/orders')) {
        return next();
      }

      const method = req.method;
      const path = req.path;
      const headers = req.headers;
      const body = req.body;
      const query = req.query;

      this.logger.log(`Processing ${method} request to ${path}`);
      
      const result = await this.gatewayService.handleRequest(
        method,
        path,
        headers,
        body,
        query,
      );

      this.logger.log(`Successfully routed ${method} request to ${path}`);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.logger.error(`Error handling request: ${error.message}`);
      
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response || error.message || 'Internal Server Error';
      
      const circuitInfo = error.circuitBreakerState ? 
        { circuitBreaker: error.circuitBreakerState } : {};
      
      return res.status(status).json({
        statusCode: status,
        message: message,
        timestamp: new Date().toISOString(),
        path: req.url,
        ...circuitInfo
      });
    }
  }
}
