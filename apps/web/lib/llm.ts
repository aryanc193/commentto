import OpenAI from "openai";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn("GROQ_API_KEY is not set");
}

// Groq uses an OpenAI-compatible API
const client = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

// Centralized model config (easy future swap)
const MODEL = "llama-3.1-8b-instant";

/**
 * Summarize long-form content into a concise overview.
 */
export async function summarizeText(content: string): Promise<string> {
  if (!client) {
    throw new Error("LLM client not configured");
  }

  const prompt = `
Summarize the content below in 2–4 sentences (30–70 words).

Rules:
- Do not hallucinate
- Do not add opinions
- Plain text only

Content:
${content}
`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You are a precise and neutral summarization assistant.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
  });

  const text = response.choices[0]?.message?.content;

  if (!text) {
    throw new Error("Empty response from LLM");
  }

  return text.trim();
}

/**
 * Derive a reusable voice profile from either:
 * - a natural language description
 * - writing samples
 */
export async function deriveVoiceProfile(params: {
  description?: string;
  samples?: string[];
}): Promise<string> {
  if (!client) {
    throw new Error("LLM client not configured");
  }

  let prompt = "";

  if (params.samples) {
    const combined = params.samples.join("\n\n---\n\n").slice(0, 12000);

    prompt = `
Analyze the following writing samples and infer a concise VOICE PROFILE.

Describe in 1–2 sentences:
- Tone
- Sentence length and structure
- Typical patterns (questions, reactions, directness)

Rules:
- Do NOT quote the samples
- Do NOT mention the samples explicitly
- Plain text only

Samples:
${combined}
`;
  } else if (params.description) {
    prompt = `
A user describes their desired writing voice as:

"${params.description}"

Convert this into a concise, concrete VOICE PROFILE (1–2 sentences)
that an AI can strictly follow when writing comments.

Rules:
- Be specific
- Avoid vague adjectives
- Plain text only
`;
  } else {
    throw new Error("No description or samples provided");
  }

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You generate concise, enforceable writing voice profiles.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.2,
  });

  const text = response.choices[0]?.message?.content;

  if (!text) {
    throw new Error("Failed to derive voice profile");
  }

  return text.trim();
}

/**
 * Generate a comment that STRICTLY follows a given voice profile.
 */
export async function generateComment(params: {
  summary: string;
  voiceProfile?: string;
}): Promise<string> {
  if (!client) {
    throw new Error("LLM client not configured");
  }

  const { summary, voiceProfile } = params;

  const prompt = `
You are writing a short comment on a post.

POST SUMMARY:
${summary}

VOICE PROFILE (STRICTLY FOLLOW):
${voiceProfile ?? "Neutral, clear, concise, professional tone"}

STYLE RULES:
- Actively express the voice profile in wording, tone, and sentence structure
- Avoid generic or corporate phrasing unless explicitly required
- Do NOT restate the summary
- Do NOT hedge or average the tone

COMMENT REQUIREMENTS:
- 2–4 sentences
- One clear reaction, insight, or reflection
- Optional question ONLY if it fits the voice
- Max 60 words
- Plain text only
- No emojis
- No hashtags

TASK:
Write the comment now.
`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You write concise, voice-accurate comments.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.45,
  });

  const text = response.choices[0]?.message?.content;

  if (!text) {
    throw new Error("Failed to generate comment");
  }

  return text.trim();
}
