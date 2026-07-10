export interface AuthUser {
  id: number;
  userName: string;
  email: string;
  role: 'guest' | 'employee' | 'admin';
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
}


export const initialAuthState: AuthState = {
  user: null,
  token: null,
  isLoggedIn: false,
  loading: false,
  error: null
};