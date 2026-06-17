"use client";

import { useRef, useState } from "react";
import { Avatar } from "./Avatar";

async function fileToResizedDataUrl(file: File, max = 200): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function PhotoInput({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex items-center gap-4">
      <Avatar name={name || "?"} image={value} size={72} />
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            const resized = await fileToResizedDataUrl(file);
            onChange(resized);
            setBusy(false);
          }}
        />
        <button
          type="button"
          className="btn-outline"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          {busy ? "Carregando..." : value ? "Trocar foto" : "Enviar foto"}
        </button>
        {value && (
          <button
            type="button"
            className="text-xs font-medium text-slate-400 hover:text-red-500"
            onClick={() => onChange(null)}
          >
            Remover foto
          </button>
        )}
      </div>
    </div>
  );
}
