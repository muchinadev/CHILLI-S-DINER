export function formatKes(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return `KSh ${value.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
