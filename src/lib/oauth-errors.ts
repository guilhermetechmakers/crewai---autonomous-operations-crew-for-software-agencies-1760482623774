// OAuth Error Types and Handlers

export const OAuthErrorType = {
  ACCESS_DENIED: 'access_denied',
  INVALID_REQUEST: 'invalid_request',
  INVALID_CLIENT: 'invalid_client',
  INVALID_GRANT: 'invalid_grant',
  UNSUPPORTED_RESPONSE_TYPE: 'unsupported_response_type',
  INVALID_SCOPE: 'invalid_scope',
  SERVER_ERROR: 'server_error',
  TEMPORARILY_UNAVAILABLE: 'temporarily_unavailable',
  NETWORK_ERROR: 'network_error',
  CONFIGURATION_ERROR: 'configuration_error',
  USER_CANCELLED: 'user_cancelled',
  UNKNOWN_ERROR: 'unknown_error',
} as const;

export type OAuthErrorType = typeof OAuthErrorType[keyof typeof OAuthErrorType];

export interface OAuthError {
  type: OAuthErrorType;
  message: string;
  description?: string;
  provider?: string;
  code?: string;
  details?: Record<string, any>;
}

export class OAuthErrorHandler {
  static parseError(error: any, provider?: string): OAuthError {
    // Handle URL parameter errors (from OAuth redirect)
    if (typeof error === 'string') {
      const errorMap: Record<string, OAuthErrorType> = {
        'access_denied': OAuthErrorType.ACCESS_DENIED,
        'invalid_request': OAuthErrorType.INVALID_REQUEST,
        'invalid_client': OAuthErrorType.INVALID_CLIENT,
        'invalid_grant': OAuthErrorType.INVALID_GRANT,
        'unsupported_response_type': OAuthErrorType.UNSUPPORTED_RESPONSE_TYPE,
        'invalid_scope': OAuthErrorType.INVALID_SCOPE,
        'server_error': OAuthErrorType.SERVER_ERROR,
        'temporarily_unavailable': OAuthErrorType.TEMPORARILY_UNAVAILABLE,
      };

      const errorType = errorMap[error] || OAuthErrorType.UNKNOWN_ERROR;
      return {
        type: errorType,
        message: this.getErrorMessage(errorType),
        provider,
        code: error,
      };
    }

    // Handle Error objects
    if (error instanceof Error) {
      if (error.message.includes('Network Error') || error.message.includes('fetch')) {
        return {
          type: OAuthErrorType.NETWORK_ERROR,
          message: 'Network connection failed. Please check your internet connection.',
          description: error.message,
          provider,
        };
      }

      if (error.message.includes('configuration') || error.message.includes('client_id')) {
        return {
          type: OAuthErrorType.CONFIGURATION_ERROR,
          message: 'OAuth configuration error. Please contact support.',
          description: error.message,
          provider,
        };
      }

      return {
        type: OAuthErrorType.UNKNOWN_ERROR,
        message: error.message,
        provider,
      };
    }

    // Handle API response errors
    if (error && typeof error === 'object') {
      if (error.status === 401) {
        return {
          type: OAuthErrorType.INVALID_CLIENT,
          message: 'Invalid OAuth client configuration.',
          provider,
          details: error,
        };
      }

      if (error.status === 400) {
        return {
          type: OAuthErrorType.INVALID_REQUEST,
          message: 'Invalid OAuth request.',
          description: error.message,
          provider,
          details: error,
        };
      }

      if (error.status >= 500) {
        return {
          type: OAuthErrorType.SERVER_ERROR,
          message: 'OAuth server error. Please try again later.',
          description: error.message,
          provider,
          details: error,
        };
      }

      return {
        type: OAuthErrorType.UNKNOWN_ERROR,
        message: error.message || 'An unknown error occurred',
        provider,
        details: error,
      };
    }

    // Fallback for unknown error types
    return {
      type: OAuthErrorType.UNKNOWN_ERROR,
      message: 'An unexpected error occurred during OAuth authentication',
      provider,
    };
  }

  static getErrorMessage(type: OAuthErrorType): string {
    const messages: Record<OAuthErrorType, string> = {
      [OAuthErrorType.ACCESS_DENIED]: 'Access was denied. Please try again and grant the necessary permissions.',
      [OAuthErrorType.INVALID_REQUEST]: 'Invalid request. Please try again.',
      [OAuthErrorType.INVALID_CLIENT]: 'OAuth client configuration error. Please contact support.',
      [OAuthErrorType.INVALID_GRANT]: 'Invalid authorization code. Please try signing in again.',
      [OAuthErrorType.UNSUPPORTED_RESPONSE_TYPE]: 'Unsupported response type. Please contact support.',
      [OAuthErrorType.INVALID_SCOPE]: 'Invalid scope requested. Please contact support.',
      [OAuthErrorType.SERVER_ERROR]: 'OAuth server error. Please try again later.',
      [OAuthErrorType.TEMPORARILY_UNAVAILABLE]: 'OAuth service temporarily unavailable. Please try again later.',
      [OAuthErrorType.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection.',
      [OAuthErrorType.CONFIGURATION_ERROR]: 'OAuth configuration error. Please contact support.',
      [OAuthErrorType.USER_CANCELLED]: 'Sign-in was cancelled. Please try again if you want to continue.',
      [OAuthErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
    };

    return messages[type] || messages[OAuthErrorType.UNKNOWN_ERROR];
  }

  static getRecoveryAction(type: OAuthErrorType): string {
    const actions: Record<OAuthErrorType, string> = {
      [OAuthErrorType.ACCESS_DENIED]: 'Try signing in again and make sure to grant all required permissions.',
      [OAuthErrorType.INVALID_REQUEST]: 'Please refresh the page and try again.',
      [OAuthErrorType.INVALID_CLIENT]: 'Please contact support with this error message.',
      [OAuthErrorType.INVALID_GRANT]: 'Please try signing in again from the beginning.',
      [OAuthErrorType.UNSUPPORTED_RESPONSE_TYPE]: 'Please contact support with this error message.',
      [OAuthErrorType.INVALID_SCOPE]: 'Please contact support with this error message.',
      [OAuthErrorType.SERVER_ERROR]: 'Please wait a few minutes and try again.',
      [OAuthErrorType.TEMPORARILY_UNAVAILABLE]: 'Please wait a few minutes and try again.',
      [OAuthErrorType.NETWORK_ERROR]: 'Please check your internet connection and try again.',
      [OAuthErrorType.CONFIGURATION_ERROR]: 'Please contact support with this error message.',
      [OAuthErrorType.USER_CANCELLED]: 'You can try signing in again whenever you\'re ready.',
      [OAuthErrorType.UNKNOWN_ERROR]: 'Please try again, and contact support if the problem persists.',
    };

    return actions[type] || actions[OAuthErrorType.UNKNOWN_ERROR];
  }

  static shouldRetry(type: OAuthErrorType): boolean {
    const retryableErrors: OAuthErrorType[] = [
      OAuthErrorType.SERVER_ERROR,
      OAuthErrorType.TEMPORARILY_UNAVAILABLE,
      OAuthErrorType.NETWORK_ERROR,
    ];

    return retryableErrors.includes(type);
  }

  static getErrorSeverity(type: OAuthErrorType): 'low' | 'medium' | 'high' {
    const highSeverity: OAuthErrorType[] = [
      OAuthErrorType.INVALID_CLIENT,
      OAuthErrorType.CONFIGURATION_ERROR,
      OAuthErrorType.UNSUPPORTED_RESPONSE_TYPE,
      OAuthErrorType.INVALID_SCOPE,
    ];

    const mediumSeverity: OAuthErrorType[] = [
      OAuthErrorType.INVALID_REQUEST,
      OAuthErrorType.INVALID_GRANT,
      OAuthErrorType.SERVER_ERROR,
      OAuthErrorType.TEMPORARILY_UNAVAILABLE,
    ];

    if (highSeverity.includes(type)) return 'high';
    if (mediumSeverity.includes(type)) return 'medium';
    return 'low';
  }
}

// Utility function to log OAuth errors for debugging
export function logOAuthError(error: OAuthError, context?: string) {
  const severity = OAuthErrorHandler.getErrorSeverity(error.type);
  const logLevel = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
  
  console[logLevel](`OAuth Error${context ? ` (${context})` : ''}:`, {
    type: error.type,
    message: error.message,
    provider: error.provider,
    description: error.description,
    details: error.details,
  });
}
