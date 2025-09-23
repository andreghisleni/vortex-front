export function calculateTotalPages(total: number, pageSize: number) {
  const totalPages = Math.ceil(total / pageSize) - 1;
  const lastPageSize = total % pageSize || pageSize;
  return { totalPages, lastPageSize };
}
