function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isDueToday(value: string): boolean {
  if (value === "Today") return true;
  const date = parseDate(value);
  return date?.getTime() === startOfToday().getTime();
}

export function isDueYesterday(value: string): boolean {
  if (value === "Yesterday") return true;
  const date = parseDate(value);
  if (!date) return false;
  const yesterday = startOfToday();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getTime() === yesterday.getTime();
}

export function isDueTomorrow(value: string): boolean {
  if (value === "Tomorrow") return true;
  const date = parseDate(value);
  if (!date) return false;
  const tomorrow = startOfToday();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.getTime() === tomorrow.getTime();
}

export function formatDueDate(value: string): string {
  if (!parseDate(value)) return value;
  const date = parseDate(value)!;
  if (isDueToday(value)) return "Today";
  if (isDueTomorrow(value)) return "Tomorrow";
  if (isDueYesterday(value)) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function getLocalDateInputValue(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
