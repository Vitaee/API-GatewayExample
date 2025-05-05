import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  
  // JWT Configuration
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRATION: Joi.string().default('1h'),
  
  // API Key settings
  API_KEY_HEADER_NAME: Joi.string().default('x-api-key'),
  
  // Rate limiting
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),
  
  // Service URLs
  USER_SERVICE_URL: Joi.string().default('http://localhost:3001'),
  PRODUCT_SERVICE_URL: Joi.string().default('http://localhost:3002'),
  ORDER_SERVICE_URL: Joi.string().default('http://localhost:3003'),
  
  // Cache settings
  CACHE_TTL: Joi.number().default(60),
  
  // Circuit breaker
  CIRCUIT_BREAKER_TIMEOUT: Joi.number().default(3000),
  CIRCUIT_BREAKER_RESET_TIMEOUT: Joi.number().default(30000),
  CIRCUIT_BREAKER_ERROR_THRESHOLD: Joi.number().default(50),
});
