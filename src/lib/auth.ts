import { adminClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const auth = createAuthClient({
  plugins: [adminClient()],
  baseURL: 'https://api.vortex.andreg.com.br/auth/api',
});
