import OpenAI from "openai";

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn("GROQ_API_KEY is not set");
}

const client = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    })
  : null;

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
 * Derive a reusable voice profile + display name from a description.
 */
export async function deriveVoiceProfile(params: {
  description: string;
}): Promise<{ profile: string; name: string }> {
  if (!client) {
    throw new Error("LLM client not configured");
  }

  const prompt = `
A user describes their desired writing voice as:

"${params.description}"

Your task:
Convert this into a BEHAVIORAL VOICE PROFILE that captures how this writer thinks and sounds.

The profile should describe:
- The writer's mental stance before responding
- How they phrase reactions or opinions
- Their typical sentence rhythm and word choice
- Their emotional relationship to the reader

Guidelines:
- Interpret vague traits as observable writing behavior
- Do NOT repeat the user's words
- If the voice implies a character, persona, dialect, or internet archetype,
  explicitly allow stylized language, slang, accent, or broken grammar
- If the voice implies a thoughtful or realistic mode, describe grounded human behavior
- 1–2 sentences total
- Natural language, not rules
- Plain text only

Additionally, create a SHORT NAME for this voice (3–5 words).

Format your response EXACTLY as:
NAME: [name here]
PROFILE: [profile here]

Write now.
`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You translate voice descriptions into natural writing behavior.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.5,
  });

  const text = response.choices[0]?.message?.content;

  if (!text) {
    throw new Error("Failed to derive voice profile");
  }

  const nameMatch = text.match(/NAME:\s*(.+)/i);
  const profileMatch = text.match(/PROFILE:\s*([\s\S]+)/i);

  const name = nameMatch?.[1]?.trim() || params.description.slice(0, 30);
  const profile = profileMatch?.[1]?.trim() || text.trim();

  return { name, profile };
}

/**
 * Generate a comment that embodies a given voice profile.
 */
export async function generateComment(params: {
  summary: string;
  voiceProfile?: string;
  regenerate?: boolean;
}): Promise<string> {
  if (!client) {
    throw new Error("LLM client not configured");
  }

  const { summary, voiceProfile } = params;

  const prompt = `
You are writing a human comment on a post.

POST CONTEXT:
${summary}

WRITING VOICE:
${voiceProfile ?? "Neutral, clear, thoughtful"}

How to write:
- Fully embody the voice—let it shape wording, rhythm, confidence, and restraint
- React like a real person encountering this post, not like someone summarizing or teaching
- Do NOT restate the post
- Do NOT explain the voice or announce intent

Voice behavior rules:
- If the voice is performative (character, dialect, persona):
  - Prioritize character, tone, and entertainment over insight or completeness
  - Lean into exaggeration, slang, metaphor, or stylized grammar
  - It is acceptable to focus on one detail, ignore others, or be unserious
  - Avoid sounding like a lesson, takeaway, or retrospective analysis
- If the voice is interpretive (thoughtful, skeptical, honest, minimalist):
  - Prioritize natural human insight and stance
  - Say only what this voice would realistically say
  - Avoid over-explaining once the point is made
  - Avoid hedging phrases like “I think” or “it seems” unless the voice values uncertainty

Length:
- As short as possible, as long as necessary
- Stop once the reaction feels complete for this voice
- Some voices should end early rather than fully develop the idea
- 1–4 sentences depending on voice and context

Optional:
- Ask a question ONLY if it feels natural for this voice (not required)

Constraints:
- Plain text only
- No emojis
- No hashtags

${
  params.regenerate
    ? `
Write a different take on the same idea.
Keep the same voice and intent, but vary phrasing, rhythm, or angle.
Do not contradict the original meaning.
`
    : ""
}

Write the comment now.
`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: "You write natural, voice-shaped comments.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
  });

  const text = response.choices[0]?.message?.content;

  if (!text) {
    throw new Error("Failed to generate comment");
  }

  return text.trim();
}

export async function enhanceDraft(params: {
  draft: string;
  voiceProfile?: string;
  regenerate?: boolean;
}): Promise<string> {
  if (!client) throw new Error("LLM client not configured");

  const prompt = `
You are improving a human-written comment.

ORIGINAL COMMENT:
${params.draft}

WRITING VOICE:
${params.voiceProfile ?? "Neutral, clear, thoughtful"}

Task:
- Improve clarity, flow, and tone
- Preserve the original intent and meaning
- Do NOT add new ideas
- Do NOT turn this into a summary
- Sound like a real human, not polished marketing copy

${
  params.regenerate
    ? `
Write a different improved version with the same intent.
Vary phrasing and rhythm, but keep meaning intact.
`
    : ""
}

Constraints:
- Plain text only
- No emojis
- No hashtags

Write the improved comment now.
`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: "You edit comments, you do not invent them." },
      { role: "user", content: prompt },
    ],
    temperature: 1,
  });

  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error("Failed to enhance draft");

  return text.trim();
}
