// Simulated delay to mimic network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    name: string;
  };
  error?: string;
}

export interface LogoutResponse {
  success: boolean;
}

/**
 * Simulates an API call to authenticate a user
 * @param credentials User login credentials
 * @returns Promise with login response
 */
export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  // Simulate network delay
  await delay(1000);

  // Dummy validation logic
  if (credentials.username && credentials.password) {
    // For demo purposes, accept any non-empty username/password
    // In a real app, this would make an actual API call
    return {
      success: true,
      token: "dummy-jwt-token-" + Math.random().toString(36).substring(2, 15),
      user: {
        id: "user-123",
        username: credentials.username,
        name: "Demo User",
      }
    };
  } else {
    return {
      success: false,
      error: "Invalid username or password"
    };
  }
};

/**
 * Simulates an API call to log out a user
 * @param token User's authentication token
 * @returns Promise with logout response
 */
export const logoutUser = async (token?: string): Promise<LogoutResponse> => {
  // Simulate network delay
  await delay(800);

  // In a real app, this would make an actual API call to invalidate the token
  return {
    success: true
  };
};