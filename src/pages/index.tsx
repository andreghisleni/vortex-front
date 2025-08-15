import { createFileRoute } from '@tanstack/react-router';
import { auth } from '@/lib/auth';

export const Route = createFileRoute('/')({
  component: Home,
});

export function Home() {
  const { data } = auth.getSession();

  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the home page!</p>
    </div>
  );
}
