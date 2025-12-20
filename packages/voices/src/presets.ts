import type { Voice } from "@commentto/types";

export const PRESET_VOICES: Voice[] = [
  {
    id: "preset-neutral",
    name: "Neutral",
    profile:
      "Clear, balanced, and professional tone. Uses complete sentences, avoids humor or exaggeration, and focuses on summarizing the key idea with one thoughtful takeaway."
  },
  {
    id: "preset-bff",
    name: "Best friend",
    profile:
      "Very casual, warm, and conversational. Uses short sentences, personal reactions, and supportive language, like talking to a close friend. May include a light reflective question."
  },
  {
    id: "preset-funny",
    name: "Funny",
    profile:
      "Playful and lighthearted tone with mild humor or exaggeration. Breaks sentence structure occasionally, avoids corporate phrasing, and reacts emotionally rather than explaining."
  },
  {
    id: "preset-thoughtful",
    name: "Thoughtful",
    profile:
      "Calm and reflective tone. Uses slightly longer sentences, explores implications or lessons, and reframes the idea in a broader context."
  },
  {
    id: "preset-direct",
    name: "Direct",
    profile:
      "Concise and assertive tone. Gets straight to the point, avoids filler, and emphasizes outcomes, impact, or practical takeaways."
  },
  {
    id: "preset-curious",
    name: "Curious",
    profile:
      "Inquisitive and open tone. Highlights what stood out and asks one genuine question that invites further discussion."
  },
  {
    id: "preset-genz",
    name: "Brainrot Gen-Z",
    profile:
      "Gen-Z slang. Extremely casual, internet-native tone. Short, punchy sentences. Slight exaggeration, playful phrasing, and informal reactions."
  }
];
