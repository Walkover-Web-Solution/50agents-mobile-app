/**
 * API Configuration
 * Centralized API endpoints, headers, and settings
 */

export const API_CONFIG = {
  // Base URLs
  BASE_URL: 'https://routes.msg91.com/api',
  CHAT_BASE_URL: 'https://chat.50agents.com',
  WEBSOCKET_URL: 'wss://your-websocket-server.com', // <-- Replace with your actual WebSocket server URL
  
  // API Keys and Authentication
  AUTH_KEY: '338350fba412c8c973c4fdb292a2a9c6',
  FEATURE_ID: '870623b1736406370677f756255301',
  REFERENCE_ID: '870623a1697443499652ceeab330e5',
  
  // Timeouts (in milliseconds)
  REQUEST_TIMEOUT: 30000,
  CONNECTION_TIMEOUT: 15000,
  
  // Headers matching exact curl command
  HEADERS: {
    'Accept': '*/*',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7',
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json',
    'Origin': 'https://chat.50agents.com',
    'Pragma': 'no-cache',
    'Priority': 'u=1, i',
    'Referer': 'https://chat.50agents.com/',
    'Sec-CH-UA': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
    'Sec-CH-UA-Mobile': '?0',
    'Sec-CH-UA-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
  },
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication
    GET_AUTH_TOKEN: '/870623b1736406370677f756255301/getAuthToken',
    
    // Organizations
    GET_ORGANIZATIONS: '/c/getDetails',
    
    // Agents/Dashboard
    GET_AGENTS: '/proxy/870623a1697443499652ceeab330e5/agent/',
    
    // Chat
    CHAT_URL: 'https://chat.50agents.com/870623a1697443499652ceeab330e5/870623b1736406370677f756255301/chat',
  },
  
  // Response formats and validation
  RESPONSE: {
    SUCCESS_STATUS: 'success',
    ERROR_STATUS: 'error',
    TOKEN_FIELDS: ['token', 'proxy_auth_token', 'data.token', 'data.proxy_auth_token'],
  },
};

export default API_CONFIG;
