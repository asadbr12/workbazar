export function formatFee(feePerDay: number | null, feePerHour: number | null) {
  const parts: string[] = [];
  if (feePerDay) parts.push(`₹${feePerDay}/day`);
  if (feePerHour) parts.push(`₹${feePerHour}/hr`);
  return parts.length > 0 ? parts.join(" · ") : "Fee not listed";
}
