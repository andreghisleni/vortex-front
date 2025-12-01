import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Header } from '@/components/navbar-components/header';
import { useDbInfo } from '@/http/generated';
import { auth } from '@/lib/auth';

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

  if (!data?.isProduction || data?.nodeEnv === 'production') {
    return null;
  }

  return (
    <div className='bg-red-600 px-4 py-2 text-center font-medium text-sm text-white'>
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
