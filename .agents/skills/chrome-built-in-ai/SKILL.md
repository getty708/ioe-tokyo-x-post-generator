---
name: chrome-built-in-ai
description: Guidelines, environment flags, constraints, and reference implementations for Chrome's Built-in AI APIs (LanguageModel, Summarizer, Translator, LanguageDetector) in their GA/Modern forms.
---

# Chrome Built-in AI Integration Guidelines

This skill provides the technical specs, browser configuration, parameters, and references to develop web applications using Chrome's Built-in AI (on-device Gemini Nano/specialized models).

---

## 1. Operating Environment & Architecture

### Supported APIs (Top-level Globals)
In modern Chrome (GA), the Built-in AI APIs are exposed as top-level constructors on the global scope (`window` or `self`):
- **`LanguageModel`**: The generic Prompt API. Used for structured query generation, chat, and custom prompt execution.
- **`Summarizer`**: Tuned specifically for text summarization.
- **`Translator`**: Performs client-side translation between language pairs.
- **`LanguageDetector`**: Identifies the language of a text block.

### Checking Availability
API availability must be queried using the static `.availability()` method on each class:
```javascript
const status = await LanguageModel.availability();
// Returns: 'available' | 'downloadable' | 'downloading' | 'unavailable'
```
*Status Mapping (Legacy Support)*:
- `'available'` / `'readily'` -> Ready to create sessions.
- `'downloadable'` / `'after-download'` -> Model is not yet present on device but can be downloaded.
- `'downloading'` -> Download is already in progress.
- `'unavailable'` / `'no'` / `'unsupported'` -> API is unsupported on this hardware or OS.

### Model Download & User Gestures (CRITICAL)
> [!IMPORTANT]
> If `availability()` returns `'downloadable'`, calling `create()` to trigger the download **MUST be initiated by a user gesture** (such as a click event). Calling `create()` programmatically on page load without user interaction will throw a `NotAllowedError`.

---

## 2. API Specifications

### LanguageModel (Prompt API)
```javascript
// Initialize model
const session = await LanguageModel.create({
  systemPrompt: "You are a helpful assistant.",
  expectedInputs: [
    { type: "text", languages: ["ja"] }
  ],
  expectedOutputs: [
    { type: "text", languages: ["ja"] }
  ],
  monitor(m) {
    m.addEventListener('downloadprogress', (e) => {
      console.log(`Download progress: ${e.loaded}/${e.total}`);
    });
  }
});

// Run inference
const response = await session.prompt("Write a short poem.");
session.destroy(); // Release resources when done
```

---

## 3. Parameter Specifications

### Summarizer API
```javascript
const summarizer = await Summarizer.create({
  type: "key-points", // "key-points" | "tldr" | "teaser" | "headline"
  length: "medium",    // "short" | "medium" | "long"
  expectedInputLanguages: ["ja"],
  outputLanguage: "ja"
});
```

---

## 4. Structured References Directory

Use the complete sample implementations in the [references](./references/README.md) directory to speed up development.

### Core Modules
- [feature-detection.js](./references/feature-detection.js) - Model availability check and download progress monitoring. (Ref: [Chrome Docs](https://developer.chrome.com/docs/ai/get-started))
- [prompt-structured.js](./references/prompt-structured.js) - Structured JSON outputs with schema and cancellation control. (Ref: [ahmadalfy/chrome-ai-features-demo](https://github.com/ahmadalfy/chrome-ai-features-demo))
- [prompt-multimodal.js](./references/prompt-multimodal.js) - Loading images via `ImageBitmap` and audio buffers into Prompt API. (Ref: [Raymond Camden](https://www.raymondcamden.com/2025/05/22/multimodal-support-in-chromes-built-in-ai))
- [translation-sequential.js](./references/translation-sequential.js) - Sequential queuing for translators to avoid thread blocks. (Ref: [Chrome Docs](https://developer.chrome.com/docs/ai/get-started))
- [session-compacting.js](./references/session-compacting.js) - Auto-compressing dialog sessions to prevent `QuotaExceededError`. (Ref: [yoichiro/zero-knowledge-pitch-builder](https://github.com/yoichiro/zero-knowledge-pitch-builder))

### Sample Web Applications & Tools
- [Status Checker & Codelab Mock](./references/builtin-ai-api-status/README.md) - Normalized availability checkers, download managers, and Codelab prompts. (Ref: [yoichiro/builtin-ai-api-status](https://github.com/yoichiro/builtin-ai-api-status) and [yoichiro/chrome-builtin-ai-api-codelab](https://github.com/yoichiro/chrome-builtin-ai-api-codelab))
- [Demo Dashboard App](./references/demo-dashboard/README.md) - Vanilla CSS dashboard to test all APIs dynamically. (Ref: [Google Labs Web AI Demos](https://github.com/GoogleChromeLabs/web-ai-demos))
- [Pitch Builder App](./references/zero-knowledge-pitch-builder/README.md) - Multi-model elevator pitch generator with parallel session reviews. (Ref: [yoichiro/zero-knowledge-pitch-builder](https://github.com/yoichiro/zero-knowledge-pitch-builder))
- [InSite Pagebot Widget](./references/insite-pagebot/README.md) - Floating chat assistant page analyzer. (Ref: [michaelwasserman/ai-examples](https://github.com/michaelwasserman/ai-examples))
- [Webcam Stream Analyzer](./references/webcam-multimodal/README.md) - Real-time camera stream visual descriptor. (Ref: [Zenn (Finatext)](https://zenn.dev/finatext/articles/236a27fa78817d))
- [Chrome MV3 Extension Template](./references/chrome-extension/README.md) - Complete setup pattern for service worker & side panel extensions. (Ref: [Zenn (satetsu888)](https://zenn.dev/satetsu888/articles/chrome-prompt-api-extension) / [Romin Irani](https://medium.com/google-cloud/chrome-built-in-ai-experiments-code-explanation-chrome-extension-16c79a092398))

---

## 5. Troubleshooting & Diagnostics

- **`chrome://on-device-internals`**: Visit this internal page in Chrome to monitor the download status, see model details, verify version hashes, or remove downloaded models.
- **`chrome://components`**: Verify that "Optimization Guide On-Device Model" is updated to the latest version.

---

## 6. Core Lessons & Anti-Patterns (Avoid Errors)

### Anti-Patterns (Led to Errors in Past Implementations)
- **Checking `window.ai` First**: Older models checked `window.ai` as the only indicator. On modern Chrome, the constructors (like `LanguageModel`) are bound directly on the global scope (`window.LanguageModel`). Checking only `window.ai` triggers false-negative "Built-in AI is disabled" errors.
- **Using `capabilities()`**: Obsolete API specifications used `capabilities()` or `capabilities().available`. Modern GA implementations use `availability()` on the constructor. Using the old methods will throw exceptions.
- **Auto-downloading on Mount**: Tracing `.create()` programmatically on page load when a model is downloadable throws a `NotAllowedError`. Initiate downloads strictly via click events.
- **Ignoring Output Languages Constraints**: Not specifying `expectedOutputs: [{ type: "text", languages: ["ja"] }]` when calling `.create()` on Japanese prompts prints browser console warnings.

### Key Success Factors
- **Dynamic Slot Offsets**: To generate diverse phrasing using on-device models, vary the system prompt tone (e.g., short, frank, descriptive) and apply tiny temperature offsets (e.g., base temperature +/- 0.2) to each parallel generation request.
- **Deterministic Post-processing**: Do not rely on LLM prompts to append hashtags or formatting tags consistently. Strip stray hashtags using Regex in JavaScript and append them deterministically.
- **Active Reference Collection**: **A core task of this skill is to identify and automatically add new reference directories and files when useful on-device AI code blocks or status checkers are discovered.**
