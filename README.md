# API Gateway

A modern API Gateway implemented with NestJS v11 and TypeScript that can handle high request volumes and be easily extended for new services.

## Features

### Core Features
- Route management for different microservices
- Authentication (JWT and API Key)
- Rate limiting per IP and user
- Comprehensive logging
- Error handling
- Circuit breaker pattern
- Response caching
- Health checks

### Mock Services
- Users Service
- Products Service
- Orders Service

## Gateway Flow

### Overview

The API Gateway serves as a unified entry point for client applications to communicate with various microservices. It manages the flow of requests and responses between clients and backend services.



<img src='https://i.postimg.cc/NjgfsWpS/12.png' border='0' alt='12'/>

### Detailed Sequence

The following sequence diagram details the interaction between components during request processing:

<img src='https://i.postimg.cc/25S6wPWh/Ekran-g-r-nt-s-2025-05-06-012944.png' border='0' alt='Ekran-g-r-nt-s-2025-05-06-012944'/>

### Step-by-Step Process

1. **Request Reception**: 
   - The Gateway Controller intercepts all incoming API requests
   - Requests to microservice paths (`/users`, `/products`, `/orders`) are processed

2. **Authentication & Authorization**:
   - Requests are authenticated using JWT tokens or API Keys
   - Public endpoints (marked with `@Public()`) bypass authentication
   - Authenticated user/client information is attached to the request

3. **Circuit Breaker Pattern**:
   - Prevents cascading failures when services are unresponsive
   - If a service is failing, the circuit "opens" and returns a fallback response
   - Periodically allows test requests to check if service has recovered

4. **Caching Strategy**:
   - GET requests can be cached based on configuration
   - Cache keys are generated using method, path, and query parameters
   - TTL (Time To Live) is configurable per route

5. **Service Routing**:
   - Routes are dynamically matched based on URL path
   - Parameters in routes (e.g., `/users/:id`) are extracted and forwarded
   - Service URLs are configured via environment variables

6. **Response Handling**:
   - Successful responses are returned to the client
   - GET responses may be cached for future requests
   - Error responses are formatted consistently

7. **Resilience Patterns**:
   - Timeout handling prevents long-running requests
   - Retry policies for transient failures
   - Fallback responses when services are unavailable

## Running the app

```bash
git clone https://github.com/Vitaee/API-GatewayExample.git

```

```bash
docker compose build

docker compose up
```

## Environment Variables

Create a `.env.production` file in the root directory with the following variables:

```
# API Gateway Configuration
PORT=3000

# Auth
JWT_SECRET=your_secret_key
JWT_EXPIRATION=1h
API_KEY_HEADER_NAME=x-api-key

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Service URLs
USER_SERVICE_URL=http://docker-service1:3001
PRODUCT_SERVICE_URL=http://docker-service2:3002
ORDER_SERVICE_URL=http://docker-service3:3003

# Cache Settings
CACHE_TTL=60

# Circuit Breaker
CIRCUIT_BREAKER_TIMEOUT=3000
CIRCUIT_BREAKER_RESET_TIMEOUT=30000
CIRCUIT_BREAKER_ERROR_THRESHOLD=50
```

## Test gateway with apache benchmark

```
ab -n 10000 \
   -c 200 \
   -H "Authorization: Bearer verysecrettoken" \
   http://localhost:3000/users
```