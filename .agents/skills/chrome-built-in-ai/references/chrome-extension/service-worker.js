/**
 * @file service-worker.js
 * @description Background Service Worker for Chrome MV3 Extension.
 * Handles side panel opening and offloads Prompt API session creation.
 * @reference https://zenn.dev/satetsu888/articles/chrome-prompt-api-extension
 * @license Apache-2.0
 */

// 1. Open side panel when extension icon is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// 2. Background prompt session state
let extensionSession = null;

// Initialize session in the background service worker
async function getOrInitSession() {
  if (extensionSession) return extensionSession;

  // Verify Prompt API availability
  if (!chrome.aiOriginTrial || !chrome.aiOriginTrial.languageModel) {
    // Check fallback for native chrome.ai standard interfaces
    if (typeof ai === 'undefined' || !ai.languageModel) {
      throw new Error('Built-in Prompt API is unavailable in this Extension context.');
    }
  }

  const aiTarget = typeof ai !== 'undefined' ? ai : chrome.aiOriginTrial;

  extensionSession = await aiTarget.languageModel.create({
    systemPrompt: "You are a helpful side-panel Chrome Extension companion. Answer briefly in 2 sentences."
  });

  return extensionSession;
}

// 3. Message passing listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'executePrompt') {
    (async () => {
      try {
        const session = await getOrInitSession();
        const response = await session.prompt(request.prompt);
        sendResponse({ success: true, response });
      } catch (err) {
        console.error('[Service Worker] Prompt failed:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep message channel open for async response
  }
});
