import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/reset-password/$token')({
  component: RouteComponent,
});

function RouteComponent() {
  const { token } = Route.useParams();
  return <div>Hello "/_auth/reset-password/{token}"!</div>;
}
