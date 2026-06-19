"use client";

import Image from "next/image";
import { BrazilFlag } from "@/components/BrazilFlag";

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
        <span className="gabriel-runner-label inline-flex items-center gap-1">
          VAI BRASIL!
          <BrazilFlag className="h-3 w-4" />
        </span>
      </div>
    </div>
  );
}
