// hooks/use-pagination.ts

import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { calculateTotalPages } from '@/utils/calculate-total-pages';

export function usePagination({
  total,
  showing,
}: {
  total?: number;
  showing?: number;
}) {
  // 1. Gerencia os estados 'pageIndex' e 'pageSize' da URL com nuqs
  const [{ pageIndex, pageSize }, setQuery] = useQueryStates(
    {
      // pageIndex é um inteiro, com valor padrão 0
      pageIndex: parseAsInteger.withDefault(0),
      // pageSize é uma string, com valor padrão '10' (pode ser parseAsInteger se preferir)
      pageSize: parseAsString.withDefault('10'),
    },
    {
      // Atualiza a URL sem rolar a página para o topo
      shallow: false,
    }
  );

  // 2. Funções para atualizar a paginação
  function navigateToPage(p: number) {
    // Atualiza apenas o pageIndex na URL
    setQuery({ pageIndex: p });
  }

  function setPageSize(l: string) {
    // Atualiza o pageSize e reseta o pageIndex para a primeira página
    setQuery({ pageSize: l, pageIndex: 0 });
  }

  // 3. Cálculos derivados do estado da URL e das props
  const t = total || 0;
  // Converte pageSize (string) para número para o cálculo
  const numericPageSize = Number.parseInt(pageSize, 10);

  const { totalPages, lastPageSize } = calculateTotalPages(t, numericPageSize);

  // 4. Retorna tudo o que o componente precisa
  return {
    pageIndex,
    pageSize: numericPageSize,
    navigateToPage,
    setPageSize,
    totalPages,
    lastPageSize,
    total: t,
    showing: showing || 0,
  };
}
