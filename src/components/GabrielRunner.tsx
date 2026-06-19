"use client";

import Image from "next/image";

export function GabrielRunner() {
  return (
    <div className="gabriel-runner pointer-events-none fixed z-[60]" aria-hidden>
      <div className="gabriel-runner-body">
        <Image
          src="/image/gabriel.jpeg"
          alt=""
          width={72}
          height={72}
          className="gabriel-runner-photo"
          priority
        />
        <span className="gabriel-runner-label">VAI BRASIL! 🇧🇷</span>
      </div>
    </div>
  );
}
