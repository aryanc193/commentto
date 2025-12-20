"use client";

import { useState } from "react";
import { Copy, CopyCheck } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "inline-flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="
      w-full
      btn-gradient
    mt-3
    gap-2
    rounded-lg
    border
    border-[#1f2937]
    bg-gradient-to-br from-[#00ffd9] to-[#0080ff]
    px-3
    py-2
    text-sm
    font-medium
    text-black
    transition
    hover:opacity-90
    active:scale-[0.98]
  "
    >
      {copied ? (
        <>
          <CopyCheck size={16} />
          <span className="leading-none">Copied</span>
        </>
      ) : (
        <>
          <Copy size={16} />
          <span className="leading-none">Copy</span>
        </>
      )}
    </button>
  );
}
