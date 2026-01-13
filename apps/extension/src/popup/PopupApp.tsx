"use client";

import { useState, useEffect } from "react";
import type { Voice } from "@commentto/types";
import { PRESET_VOICES } from "@commentto/voices";
import { Skeleton, CopyButton } from "@commentto/ui";
import { loadCustomVoices, saveCustomVoices } from "./storage";

export default function PopupApp() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");

  const [summary, setSummary] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceDescription, setVoiceDescription] = useState("");

  /* ---------- init voices ---------- */
  useEffect(() => {
    loadCustomVoices().then((custom) => {
      const all = [...PRESET_VOICES, ...custom];
      setVoices(all);
      setSelectedVoiceId(all[0].id);
    });
  }, []);

  /* ---------- persist custom voices ---------- */
  useEffect(() => {
    const custom = voices.filter((v) => !v.id.startsWith("preset-"));
    saveCustomVoices(custom);
  }, [voices]);

  const selectedVoice = voices.find((v) => v.id === selectedVoiceId);

  /* ---------- generation ---------- */
  async function handleGenerate() {
    if (!selectedVoice) return;

    setLoading(true);
    setSummary("");
    setComment("");

    chrome.runtime.sendMessage(
      {
        type: "GENERATE_COMMENT",
        voiceProfile: selectedVoice.profile,
      },
      (res) => {
        setLoading(false);

        if (res?.error) {
          alert(res.error);
          return;
        }

        setSummary(res.summary);
        setComment(res.comment);
      }
    );
  }

  /* ---------- create voice ---------- */
  async function handleCreateVoice() {
    if (!voiceDescription.trim()) return;

    const res = await fetch(
      "https://commentto-web.vercel.app/api/voice-profile",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: voiceDescription }),
      }
    );

    const data = await res.json();

    // const newVoice: Voice = {
    //   id: crypto.randomUUID(),
    //   name: voiceDescription.split(",")[0].slice(0, 24),
    //   profile: data.voiceProfile,
    // };

    const { name, profile } = data.voiceProfile;

    const newVoice: Voice = {
      id: crypto.randomUUID(),
      name,
      profile,
    };

    setVoices((v) => [...v, newVoice]);
    setSelectedVoiceId(newVoice.id);
    setVoiceDescription("");
    setShowVoiceModal(false);
  }

  /* ---------- remove voice ---------- */
  function handleRemoveVoice(id: string) {
    setVoices((v) => v.filter((voice) => voice.id !== id));
    setSelectedVoiceId(PRESET_VOICES[0].id);
  }

  return (
    <div className="min-w-[320px] max-w-[380px] space-y-4 p-3">
      <h1 className="text-lg font-semibold tracking-tight">Commentto</h1>
      <p className="text-xs text-[var(--subtle)]">
        Thoughtful comments, instantly.
      </p>

      {/* Voice selector */}
      <div className="flex items-center gap-2">
        <select
          className="flex-1 rounded-lg border border-[#1f2937] bg-[#020617] px-2 py-1 text-sm"
          value={selectedVoiceId}
          onChange={(e) => setSelectedVoiceId(e.target.value)}
        >
          {voices.map((v) => (
            <option key={v.id} value={v.id} title={v.profile}>
              {v.name}
            </option>
          ))}
        </select>

        {selectedVoice && !selectedVoice.id.startsWith("preset-") && (
          <button
            onClick={() => handleRemoveVoice(selectedVoice.id)}
            className="text-xs rounded-md border border-[#1f2937] px-2 py-1 hover:bg-[#020617]"
            title="Remove voice"
          >
            Remove
          </button>
        )}

        <button
          onClick={() => setShowVoiceModal(true)}
          className="rounded-md bg-gradient-to-br from-[#00ffd9] to-[#0080ff] px-2 py-1 text-xs text-black"
        >
          + New
        </button>
        {selectedVoice && (
          <p className="mt-1 text-xs text-[var(--subtle)]">
            {selectedVoice.profile}
          </p>
        )}
      </div>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`w-full rounded-xl py-2 text-sm font-medium text-black transition
    bg-[#00eed0]
    ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}
  `}
      >
        {loading ? "Generating…" : "Generate comment"}
      </button>

      {/* Loading */}
      {loading && (
        <>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
        </>
      )}

      {/* Result */}
      {!loading && summary && (
        <>
          <div className="space-y-4 rounded-xl p-1">
            <div>
              <h3 className="text-[10px] uppercase tracking-wide text-[var(--subtle)]">
                Summary
              </h3>
              <p className="mt-2 text-sm border border-[#1f2937] bg-[#020617] p-2 leading-relaxed">
                {summary}
              </p>
            </div>

            <div>
              <h3 className="text-[10px] uppercase tracking-wide text-[var(--subtle)]">
                Comment
              </h3>
              <p className="mt-2 mb-2 border border-[#1f2937] bg-[#020617] whitespace-pre-wrap p-2 text-sm leading-relaxed">
                {comment}
              </p>
              <CopyButton text={comment} />
            </div>
          </div>
        </>
      )}

      {/* Voice modal */}
      {showVoiceModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowVoiceModal(false)}
        >
          <div
            className="w-[90%] max-w-sm rounded-xl border border-[#1f2937] bg-[#020617] p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 text-base font-medium">
              Create a custom voice
            </h3>
            <p className="mb-3 text-sm text-[var(--subtle)]">
              Describe how the comments should sound.
            </p>

            <textarea
              rows={3}
              value={voiceDescription}
              onChange={(e) => setVoiceDescription(e.target.value)}
              className="w-full resize-none rounded-lg border border-[#1f2937] bg-[#020617] px-2 py-1 text-sm"
              placeholder="friendly, concise, curious…"
            />

            <div className="flex justify-end gap-2">
              <button
                className="text-sm text-[var(--subtle)]"
                onClick={() => setShowVoiceModal(false)}
              >
                Cancel
              </button>
              <button
                disabled={!voiceDescription.trim()}
                onClick={handleCreateVoice}
                className="rounded-md bg-gradient-to-br from-[#00ffd9] to-[#0080ff] px-2 py-1 text-xs text-black"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
