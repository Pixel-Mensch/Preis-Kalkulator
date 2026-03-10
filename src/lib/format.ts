import clsx, { type ClassValue } from "clsx";

const currencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatDate(value?: Date | string | null) {
  if (!value) {
    return "Nicht angegeben";
  }

  const resolvedValue = typeof value === "string" ? new Date(value) : value;
  return dateFormatter.format(resolvedValue);
}

export function formatDateTime(value?: Date | string | null) {
  if (!value) {
    return "Nicht angegeben";
  }

  const resolvedValue = typeof value === "string" ? new Date(value) : value;
  return dateTimeFormatter.format(resolvedValue);
}

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
