import { createRouter, RouterProvider } from '@tanstack/react-router';

import { useAuth } from './hooks/use-auth';
import { routeTree } from './route-tree.gen';

const router = createRouter({
  routeTree,
  // biome-ignore lint/style/noNonNullAssertion: <explanation>
  context: { authentication: undefined! },
  defaultNotFoundComponent: () => <div>Global Not Found :(</div>,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  const authentication = useAuth();
  return <RouterProvider context={{ authentication }} router={router} />;
}
