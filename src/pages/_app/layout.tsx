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
  const apiUrl = import.meta.env.VITE_API_URL as string;
  const isTestEnvironment = apiUrl?.includes('api.vortex-dev.andreg.com.br');

  // Banner azul para ambiente de teste
  if (isTestEnvironment) {
    return (
      <div className='bg-blue-600 px-4 py-2 text-center font-medium text-sm text-white'>
        ℹ️ Você está no ambiente de TESTE
      </div>
    );
  }

  // Banner vermelho para produção
  if (data?.isProduction && data?.nodeEnv !== 'production') {
    return (
      <div className='bg-red-600 px-4 py-2 text-center font-medium text-sm text-white'>
        ⚠️ Atenção: Você está conectado ao banco de dados de PRODUÇÃO
      </div>
    );
  }

  return null;
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
