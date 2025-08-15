import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const auth = createAuthClient({
  plugins: [adminClient()],
  baseURL: 'http://localhost:3000/auth/api',
});
