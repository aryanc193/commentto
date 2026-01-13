"use client";

import { useState, useEffect } from "react";
import type { Voice } from "@commentto/types";
import { PRESET_VOICES } from "@commentto/voices";
import { CopyButton, Skeleton } from "@commentto/ui";
import Footer from "./footer";

export default function Home() {
  const [content, setContent] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(null);

  const [summary, setSummary] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [draftMode, setDraftMode] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [voiceDescription, setVoiceDescription] = useState("");

  const [canRegenerate, setCanRegenerate] = useState(false);
  
  useEffect(() => {
    if (draftMode) {
      setSummary("");
    }
  }, [draftMode]);

  useEffect(() => {
    setVoices(PRESET_VOICES);
    setSelectedVoiceId(PRESET_VOICES[0].id);
  }, []);

  const selectedVoice = voices.find((v) => v.id === selectedVoiceId);

  async function handleGenerate(regenerate = false) {
    if (!draftMode && !content.trim()) return;
    if (draftMode && !draftText.trim()) return;

    setLoading(true);
    setSummary("");
    setComment("");

    setCanRegenerate(false);

    try {
      const res = await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          userStyle: selectedVoice?.profile,
          regenerate,
          draft: draftMode ? draftText : undefined,
        }),
      });

      const data = await res.json();
      setSummary(data.summary);
      setComment(data.comment);

      setCanRegenerate(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateVoice(description: string) {
    const res = await fetch("/api/voice-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });

    const data = await res.json();

    const { name, profile } = data.voiceProfile;

    const newVoice: Voice = {
      id: crypto.randomUUID(),
      name,
      profile,
    };

    setVoices((v) => [...v, newVoice]);
    setSelectedVoiceId(newVoice.id);
  }

  return (
    <>
      <main className="relative z-10 mx-auto max-w-[720px] px-5 py-16">
        <header className="mb-8">
          <h1 className="text-2xl font-medium">Commentto</h1>
          <p className="mt-2 text-sm text-[var(--subtle)]">
            Paste content. Get a thoughtful comment in your voice.
          </p>
        </header>

        {/* Content input */}
        <textarea
          rows={6}
          placeholder="Paste the article, post, or text here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-4 w-full resize-none"
        />

        {/* Voice selector */}
        <div className="mb-4 flex items-center gap-3">
          <select
            value={selectedVoiceId ?? ""}
            onChange={(e) => setSelectedVoiceId(e.target.value)}
            className="flex-1"
          >
            {voices.map((v) => (
              <option key={v.id} value={v.id} title={v.profile}>
                {v.name}
              </option>
            ))}
          </select>

          {selectedVoice && !selectedVoice.id.startsWith("preset-") && (
            <button
              onClick={() => {
                setVoices((v) =>
                  v.filter((voice) => voice.id !== selectedVoice.id)
                );
                setSelectedVoiceId(PRESET_VOICES[0].id);
              }}
              className="text-md bg-[var(--muted)] hover:bg-[var(--subtle)]"
              title="Remove this voice"
            >
              Remove
            </button>
          )}

          <button
            onClick={() => setShowVoiceModal(true)}
            className="btn-gradient px-3 py-2 text-black"
          >
            + New voice
          </button>
        </div>

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={draftMode}
            onChange={() => setDraftMode(!draftMode)}
          />
          Improve my draft instead
        </label>

        {draftMode && (
          <textarea
            rows={3}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            placeholder="Paste your rough comment here…"
            className="w-full rounded-lg border border-[#1f2937] bg-[#020617] px-2 py-1 text-sm"
          />
        )}

        {/* Generate */}
        <button
          onClick={() => handleGenerate()}
          disabled={loading}
          className={`mb-8 w-full bg-[var(--accent)] text-black transition-opacity ${
            loading ? "opacity-70" : ""
          }`}
        >
          {loading ? "Generating…" : "Generate"}
        </button>

        {/* Results */}
        {loading && (
          <>
            <section className="mb-6">
              <h3 className="text-xs uppercase tracking-wide text-[var(--subtle)]">
                Summary
              </h3>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-[95%]" />
                <Skeleton className="h-4 w-[88%]" />
                <Skeleton className="h-4 w-[70%]" />
              </div>
            </section>

            <section>
              <h3 className="text-xs uppercase tracking-wide text-[var(--subtle)]">
                Comment
              </h3>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-[92%]" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-[60%]" />
              </div>
            </section>
          </>
        )}

        {!loading && (comment || summary) && (
          <>
            {!draftMode && summary && (
              <section className="mb-6">
                <h3 className="text-xs uppercase tracking-wide text-[var(--subtle)]">
                  Summary
                </h3>
                <p className="mt-2">{summary}</p>
              </section>
            )}

            <section>
              <h3 className="text-xs uppercase tracking-wide text-[var(--subtle)]">
                Comment
              </h3>

              <p className="mt-2 mb-2 whitespace-pre-wrap">{comment}</p>

              <CopyButton text={comment} />
              {canRegenerate && (
                <button
                  onClick={() => handleGenerate(true)}
                  className="text-sm underline text-[var(--subtle)]"
                >
                  Try another
                </button>
              )}
            </section>
          </>
        )}

        {showVoiceModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setShowVoiceModal(false)}
          >
            <div
              className="w-[90%] max-w-md rounded-xl border border-[#1f2937] bg-[#0f172a] p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mb-1 text-base font-medium">
                Create a custom voice
              </h3>
              <p className="mb-3 text-sm text-[var(--subtle)]">
                Describe how you want the comments to sound.
              </p>

              <textarea
                rows={3}
                placeholder="e.g. friendly, concise, curious — like I'm thinking out loud"
                value={voiceDescription}
                onChange={(e) => setVoiceDescription(e.target.value)}
                className="mb-4 w-full resize-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  className="bg-transparent text-sm text-[var(--subtle)] hover:underline"
                  onClick={() => {
                    setShowVoiceModal(false);
                    setVoiceDescription("");
                  }}
                >
                  Cancel
                </button>

                <button
                  disabled={!voiceDescription.trim()}
                  onClick={async () => {
                    await handleCreateVoice(voiceDescription);
                    setVoiceDescription("");
                    setShowVoiceModal(false);
                  }}
                  className="bg-gradient-to-br from-[var(--hero1)] to-[var(--hero2)] px-4 py-2 text-black btn-gradient"
                >
                  Create voice
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
