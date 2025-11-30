import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Header } from '@/components/navbar-components/header';
import { auth } from '@/lib/auth';
import { useDbInfo } from '@/http/generated';

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
  beforeLoad: async () => {
    const { data } = await auth.getSession();
    if (!data) {
      throw redirect({ to: '/sign-in' });
    }
  },
  notFoundComponent: () => <div>App - 404!</div>,
});

function ProductionBanner() {
  const { data } = useDbInfo();

  if (!data?.isProduction) return null;

  return (
    <div className="bg-red-600 text-white text-center py-2 px-4 text-sm font-medium">
      ⚠️ Atenção: Você está conectado ao banco de dados de PRODUÇÃO
    </div>
  );
}

function RouteComponent() {
  return (
    <div className="mb-5">
      <ProductionBanner />
      <Header />
      <Outlet />
    </div>
  );
}
