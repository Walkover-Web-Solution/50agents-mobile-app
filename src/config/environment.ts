/**
 * Environment Configuration
 * Different settings for development, staging, and production
 */

export type Environment = 'development' | 'staging' | 'production';

// Determine current environment
const getCurrentEnvironment = (): Environment => {
  if (__DEV__) {
    return 'development';
  }
  
  // You can add more logic here based on your build configuration
  // For example, checking for specific build flags or bundle identifiers
  return 'production';
};

export const CURRENT_ENV = getCurrentEnvironment();

export const ENV_CONFIG = {
  development: {
    API_BASE_URL: 'https://routes.msg91.com/api',
    CHAT_BASE_URL: 'https://chat.50agents.com',
    
    // Development settings
    ENABLE_LOGS: true,
    ENABLE_DEBUG_MODE: true,
    LOG_LEVEL: 'debug',
    
    // Relaxed timeouts for development
    REQUEST_TIMEOUT: 60000, // 60 seconds
    
    // Mock data
    USE_MOCK_DATA: false,
    
    // Feature flags for development
    FEATURES: {
      ENABLE_DEV_MENU: true,
      ENABLE_PERFORMANCE_MONITOR: true,
      ENABLE_NETWORK_INSPECTOR: true,
    },
  },
  
  staging: {
    API_BASE_URL: 'https://staging-routes.msg91.com/api',
    CHAT_BASE_URL: 'https://staging-chat.50agents.com',
    
    // Staging settings
    ENABLE_LOGS: true,
    ENABLE_DEBUG_MODE: true,
    LOG_LEVEL: 'info',
    
    REQUEST_TIMEOUT: 45000, // 45 seconds
    
    USE_MOCK_DATA: false,
    
    FEATURES: {
      ENABLE_DEV_MENU: true,
      ENABLE_PERFORMANCE_MONITOR: false,
      ENABLE_NETWORK_INSPECTOR: false,
    },
  },
  
  production: {
    API_BASE_URL: 'https://routes.msg91.com/api',
    CHAT_BASE_URL: 'https://chat.50agents.com',
    
    // Production settings
    ENABLE_LOGS: false,
    ENABLE_DEBUG_MODE: false,
    LOG_LEVEL: 'error',
    
    REQUEST_TIMEOUT: 30000, // 30 seconds
    
    USE_MOCK_DATA: false,
    
    FEATURES: {
      ENABLE_DEV_MENU: false,
      ENABLE_PERFORMANCE_MONITOR: false,
      ENABLE_NETWORK_INSPECTOR: false,
    },
  },
};

// Export current environment configuration
export const CURRENT_CONFIG = ENV_CONFIG[CURRENT_ENV];

// Helper functions
export const isDevelopment = () => CURRENT_ENV === 'development';
export const isProduction = () => CURRENT_ENV === 'production';
export const isStaging = () => CURRENT_ENV === 'staging';

export default {
  CURRENT_ENV,
  CURRENT_CONFIG,
  ENV_CONFIG,
  isDevelopment,
  isProduction,
  isStaging,
};
