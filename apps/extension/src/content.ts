function extractViewportText(): string {
  const viewportHeight = window.innerHeight;

  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>("article, main, section, div")
  )
    .map((el) => {
      const rect = el.getBoundingClientRect();
      const visibleHeight =
        Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);

      return {
        el,
        visibleHeight,
        textLength: el.innerText?.length ?? 0,
      };
    })
    .filter(
      (item) =>
        item.visibleHeight > 120 &&
        item.textLength > 200
    )
    .sort(
      (a, b) =>
        b.visibleHeight * b.textLength -
        a.visibleHeight * a.textLength
    );

  return candidates[0]?.el.innerText ?? "";
}

function extractArticleText(): string {
  const root =
    document.querySelector("article") ||
    document.querySelector("main") ||
    document.body;

  return root?.innerText ?? "";
}

function extractPageText(): string {
  const viewportText = extractViewportText();

  // If viewport text looks meaningful, use it
  if (viewportText.trim().length > 300) {
    return viewportText.slice(0, 15000);
  }

  // Otherwise fallback to article-style extraction
  const articleText = extractArticleText();

  if (articleText.trim().length > 300) {
    return articleText.slice(0, 15000);
  }

  // Absolute last resort — never fail
  return document.body.innerText.slice(0, 15000);
}

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
  if (msg.type === "GET_PAGE_TEXT") {
    sendResponse({ text: extractPageText() });
  }
});
