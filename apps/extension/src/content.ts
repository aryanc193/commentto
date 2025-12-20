function extractPageText(): string {
  const root =
    document.querySelector("article") ||
    document.querySelector("main") ||
    document.body;

  return root?.innerText?.slice(0, 15000) ?? "";
}

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === "GET_PAGE_TEXT") {
    sendResponse({ text: extractPageText() });
  }
});
