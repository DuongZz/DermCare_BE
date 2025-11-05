export default {
  SANITIZE: {
    REQUEST_TOO_DEEP: 'Request too deep',
  },
  RATE_LIMIT: {
    TOO_MANY_REQUESTS: 'Too many requests',
  },
  PLATFORM: {
    INVALID_PLATFORM: 'Invalid platform',
  },
  AUTH: {
    MISSING_AUTHORIZATION_HEADER: 'Missing Authorization header',
    TOKEN_EXPIRED: 'Token expired',
    INVALID_TOKEN: 'Invalid token',
    JSON_WEB_TOKEN_ERROR: 'Json web token error',
    INVALID_TOKEN_PURPOSE: 'Invalid token purpose',
  },
  RBAC: {
    ROLE_OR_PERMISSION_NOT_FOUND: 'Role or permission not found',
    FORBIDDEN: 'Forbidden',
  },
} as const
