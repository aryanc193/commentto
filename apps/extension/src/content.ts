function extractPageText(): string {
  const viewportHeight = window.innerHeight;

  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>("article, main, section, div")
  ).filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= viewportHeight;
  });

  const best = candidates.sort(
    (a, b) => b.innerText.length - a.innerText.length
  )[0];

  return (
    best?.innerText?.slice(0, 15000) ?? document.body.innerText.slice(0, 15000)
  );
}

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === "GET_PAGE_TEXT") {
    sendResponse({ text: extractPageText() });
  }
});
