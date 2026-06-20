"use client";

import { useState } from "react";
import { initials } from "@/lib/format";

export function Avatar({
  name,
  image,
  userId,
  size = 40,
  className = "",
}: {
  name: string;
  image?: string | null;
  userId?: string;
  size?: number;
  className?: string;
}) {
  const [urlFailed, setUrlFailed] = useState(false);

  if (image && !urlFailed) {
    return (
      <img
        src={image}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setUrlFailed(true)}
        className={`rounded-full object-cover ring-2 ring-white ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (userId && !urlFailed) {
    return (
      <img
        src={`/api/users/${userId}/avatar`}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setUrlFailed(true)}
        className={`rounded-full object-cover ring-2 ring-white ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-display font-semibold text-white ring-2 ring-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(name) || "?"}
    </div>
  );
}
