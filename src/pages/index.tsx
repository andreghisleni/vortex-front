import { createFileRoute, Navigate } from '@tanstack/react-router';
import { auth } from '@/lib/auth';

export const Route = createFileRoute('/')({
  component: Home,
});

export function Home() {
  const { data, isPending } = auth.useSession();

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <Navigate replace to="/sign-in" />;
  }

  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the home page!</p>
    </div>
  );
}
