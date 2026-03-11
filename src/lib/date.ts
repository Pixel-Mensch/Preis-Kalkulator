export function isValidDateOnlyString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
  const resolvedDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return (
    resolvedDate.getUTCFullYear() === year &&
    resolvedDate.getUTCMonth() === month - 1 &&
    resolvedDate.getUTCDate() === day
  );
}

export function parseDateOnlyToUtcDate(value: string) {
  if (!isValidDateOnlyString(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map((part) => Number.parseInt(part, 10));
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}
