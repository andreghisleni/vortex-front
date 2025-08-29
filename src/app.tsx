import { AuthUIProvider } from '@daveyplate/better-auth-ui';
import {
  createRouter,
  Link,
  RouterProvider,
  useRouter,
} from '@tanstack/react-router';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/sonner';
import { auth } from './lib/auth';
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
  const r = useRouter();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthUIProvider
        authClient={auth}
        Link={({ href, ...props }) => <Link to={href} {...props} />}
        navigate={(href) => r.navigate({ href })}
        replace={(href) => r.navigate({ href, replace: true })}
      >
        <RouterProvider router={router} />
        <Toaster />
      </AuthUIProvider>
    </ThemeProvider>
  );
}
