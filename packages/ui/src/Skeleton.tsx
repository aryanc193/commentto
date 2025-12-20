export default function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] ${className}`}
    />
  );
}
