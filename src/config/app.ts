/**
 * App Configuration
 * UI settings, themes, constants, and app-wide settings
 */

export const APP_CONFIG = {
  // App Information
  APP_NAME: '50Agents',
  APP_VERSION: '1.0.0',
  
  // User Management
  REGISTERED_USERS: [
    'kartikshrivastav2004@gmail.com'
  ],
  
  // Default Values
  DEFAULTS: {
    USER_EMAIL: 'kartikshrivastav2004@gmail.com',
    USER_ID: '1', // TODO: Make dynamic based on logged-in user
    REFERENCE_ID: '870623b1736406370677f756255301',
    WIDGET_ID: '35686b68546b393235393432',
    AUTH_TOKEN: '342616T1r2IIwzQgf68a6bf7eP1',
  },
  
  // Organization Screen Colors (Root Level - Exact Match)
  ORGANIZATION_COLORS: {
    backgroundColor: '#1a1a1a',           // Dark background
    titleColor: '#87CEEB',               // Light blue title
    subtitleColor: '#B0B0B0',            // Gray subtitle
    cardBackgroundColor: '#2a2a2a',      // Dark card background
    orgNameColor: '#FFFFFF',             // White organization name
    orgSubtitleColor: '#B0B0B0',         // Gray email
    arrowColor: '#87CEEB',               // Light blue arrow
    errorTextColor: '#FF6B6B',           // Red error text
    loadingTextColor: '#B0B0B0',         // Gray loading text
    emptyTextColor: '#B0B0B0',           // Gray empty text
    retryButtonColor: '#007AFF',         // Blue retry button
    retryButtonTextColor: '#fff',        // White retry text
    logoutButtonColor: '#FF6B6B',        // Red logout button
    logoutButtonTextColor: '#FFFFFF',    // White logout text
  },
  
  // Theme Colors (50Agents Branding)
  COLORS: {
    PRIMARY: '#1a1a1a',           // Dark background
    SECONDARY: '#2a2a2a',         // Card background
    ACCENT: '#4A90E2',            // Blue accent
    SUCCESS: '#4CAF50',           // Green
    WARNING: '#FF9800',           // Orange
    ERROR: '#F44336',             // Red
    TEXT_PRIMARY: '#FFFFFF',       // White text
    TEXT_SECONDARY: '#CCCCCC',     // Gray text
    BORDER: '#333333',            // Border color
    SHADOW: 'rgba(0, 0, 0, 0.5)', // Shadow color
    
    // Organization Screen Specific Colors
    TITLE: '#87CEEB',             // Light blue for titles
    SUBTITLE: '#B0B0B0',          // Gray for subtitles  
    ORG_NAME: '#FFFFFF',          // White for organization names
    ORG_SUBTITLE: '#B0B0B0',      // Gray for emails/subtitles
    ARROW: '#87CEEB',             // Light blue arrows
    ERROR_TEXT: '#FF6B6B',        // Red error text
    LOADING_TEXT: '#B0B0B0',      // Gray loading text
    EMPTY_TEXT: '#B0B0B0',        // Gray empty state text
    RETRY_BUTTON: '#007AFF',      // Blue retry button
    RETRY_BUTTON_TEXT: '#FFFFFF', // White retry button text
    LOGOUT_BUTTON: '#FF6B6B',     // Red logout button
    LOGOUT_BUTTON_TEXT: '#FFFFFF',// White logout button text
  },
  
  // UI Settings
  UI: {
    BORDER_RADIUS: 12,
    SHADOW_ELEVATION: 5,
    ANIMATION_DURATION: 300,
    LOADING_DELAY: 500,
    
    // Spacing
    SPACING: {
      XS: 4,
      SM: 8,
      MD: 16,
      LG: 24,
      XL: 32,
    },
    
    // Font Sizes
    FONT_SIZES: {
      XS: 12,
      SM: 14,
      MD: 16,
      LG: 18,
      XL: 24,
      XXL: 32,
    },
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    PROXY_AUTH_TOKEN: 'proxy_auth_token',
    USER_EMAIL: 'user_email',
    LOGIN_TOKEN: 'login_token',
    USER_INFO: 'user_info',
  },
  
  // Navigation
  NAVIGATION: {
    INITIAL_ROUTE: 'Login',
    AUTH_ROUTES: ['Login', 'OTPVerification'],
    MAIN_ROUTES: ['OrganizationSelection', 'Dashboard', 'Chat'],
  },
  
  // Error Messages
  MESSAGES: {
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
    AUTH_ERROR: 'Authentication failed. Please login again.',
    GENERIC_ERROR: 'Something went wrong. Please try again.',
    NO_DATA: 'No data available',
    LOADING: 'Loading...',
    
    // Success Messages
    LOGIN_SUCCESS: 'Login successful!',
    DATA_LOADED: 'Data loaded successfully',
    
    // Registration
    REGISTRATION_REQUIRED: 'Currently only registered users can access this app.\n\nPlease register first on the 50Agents website.',
  },
  
  // Feature Flags
  FEATURES: {
    ENABLE_CHAT: true,
    ENABLE_SEARCH: true,
    ENABLE_NOTIFICATIONS: false,
    ENABLE_OFFLINE_MODE: false,
    ENABLE_DEBUG_LOGS: __DEV__, // Only in development
  },
  
  // Validation Rules
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_SEARCH_LENGTH: 2,
    MAX_SEARCH_LENGTH: 100,
  },
};

export default APP_CONFIG;
