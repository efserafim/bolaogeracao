export const BRAZIL_FLAG_URL = "https://flagcdn.com/w80/br.png";

export function BrazilFlag({ className = "h-5 w-7" }: { className?: string }) {
  return (
    <img
      src={BRAZIL_FLAG_URL}
      alt="Brasil"
      className={`inline-block shrink-0 rounded-sm object-cover shadow-sm ring-1 ring-black/10 ${className}`}
      width={28}
      height={20}
    />
  );
}
