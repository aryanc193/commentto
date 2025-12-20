import type { Voice } from "@commentto/types";

const STORAGE_KEY = "commentto:custom-voices";

type StorageShape = {
  [STORAGE_KEY]?: Voice[];
};

export async function loadCustomVoices(): Promise<Voice[]> {
  const result = (await chrome.storage.local.get(STORAGE_KEY)) as StorageShape;

  return Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY]! : [];
}

export async function saveCustomVoices(voices: Voice[]) {
  await chrome.storage.local.set({
    [STORAGE_KEY]: voices,
  });
}
