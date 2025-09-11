
export interface JwtPayload {
  sub: number; // User ID
  email: string; // User email
  role: string; // User role (e.g., 'user' or 'admin')
  iat?: number; // Issued at (optional, added by JWT)
  exp?: number; // Expiration (optional, added by JWT)
}