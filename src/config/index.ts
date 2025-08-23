/**
 * Configuration Index
 * Simple central export for all configurations
 */

import { API_CONFIG } from './api';
import { APP_CONFIG } from './app';

// Combined configuration object for easy access
export const CONFIG = {
  API: API_CONFIG,
  APP: APP_CONFIG,
} as const;

// Default export
export default CONFIG;
