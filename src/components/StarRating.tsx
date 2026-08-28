export default function StarRating({
  avg,
  count,
  size = "sm",
}: {
  avg: number;
  count: number;
  size?: "sm" | "md";
}) {
  if (count === 0) {
    return <span className="text-xs text-gray-400">No ratings yet</span>;
  }

  const textSize = size === "md" ? "text-base" : "text-sm";
  const rounded = Math.round(avg);

  return (
    <span className={`inline-flex items-center gap-1 ${textSize}`}>
      <span className="text-amber-500" aria-hidden>
        {"★".repeat(rounded)}
        <span className="text-gray-300">{"★".repeat(5 - rounded)}</span>
      </span>
      <span className="font-semibold text-gray-700">{avg.toFixed(1)}</span>
      <span className="text-gray-400">({count})</span>
    </span>
  );
}
