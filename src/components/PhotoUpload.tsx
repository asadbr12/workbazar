"use client";

import { useRef, useState } from "react";

export default function PhotoUpload({
  value,
  onChange,
  required,
  hideLabel,
}: {
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
  hideLabel?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/photo", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {!hideLabel && (
        <label className="label">
          Your photo {required && <span className="text-red-600">*</span>}
          <span className="ml-1 font-normal text-gray-400">आपकी फोटो</span>
        </label>
      )}
      <div className={hideLabel ? "flex items-center gap-4" : "mt-1 flex items-center gap-4"}>
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="h-16 w-16 overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-blue-400"
          >
            {value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-xl text-gray-300">
                📷
              </span>
            )}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Remove photo"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white shadow hover:bg-red-700"
            >
              ×
            </button>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            ⬆ {uploading ? "Uploading..." : value ? "Change Photo" : "Upload Photo"}
          </button>
          <p className="mt-1 text-xs text-gray-400">JPG, PNG or WEBP, up to 5MB</p>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          className="hidden"
        />
      </div>
    </div>
  );
}
