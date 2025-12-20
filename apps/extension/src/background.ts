const API_URL = "http://localhost:3000/api/comment";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GENERATE_COMMENT") {
    handleGenerate(msg, sendResponse);
    return true; // keep channel open
  }
});

async function handleGenerate(
  msg: {
    voiceProfile?: string;
  },
  sendResponse: (res: any) => void
) {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) {
      sendResponse({ error: "No active tab found" });
      return;
    }
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });

    chrome.tabs.sendMessage(tab.id, { type: "GET_PAGE_TEXT" }, (res) => {
      if (!res?.text) {
        sendResponse({ error: "No page content found" });
        return;
      }

      (async () => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);

          const apiRes = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: res.text,
              userStyle: msg.voiceProfile,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeout);

          if (!apiRes.ok) {
            throw new Error("Backend error");
          }

          const data = await apiRes.json();

          sendResponse({
            summary: data.summary,
            comment: data.comment,
          });
        } catch (err) {
          sendResponse({
            error: "Failed to generate comment. Is the backend running?",
          });
        }
      })();
    });
  } catch (err) {
    sendResponse({ error: "Failed to generate comment" });
  }
}
