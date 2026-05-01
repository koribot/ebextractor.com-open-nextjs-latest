export interface AuthUserMeResponse {
  error?: string;
  user?: {
    email: string;
    name: string;
    id: string;
    avatar_url: string;
    created_at: string;
  };
}
