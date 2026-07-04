# Reference Index and Source Mapping

This directory contains complete, runnable sample code and demo apps derived from official documentation and community implementations of Chrome's Built-in AI APIs.

Each file contains structured headers with original URLs, license info, and patterns shown.

## 1. Directory Structure and Mapping Table

| File / Directory | Source / Reference URL | Description |
| :--- | :--- | :--- |
| [README.md](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/README.md) | N/A | This index page. |
| [feature-detection.js](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/feature-detection.js) | [Chrome Built-in AI Getting Started](https://developer.chrome.com/docs/ai/get-started) | Availability detection and model download progress monitoring. |
| [prompt-structured.js](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/prompt-structured.js) | [ahmadalfy/chrome-ai-features-demo](https://github.com/ahmadalfy/chrome-ai-features-demo) | Formulating prompts with JSON Schema constraints and abort controllers. |
| [prompt-multimodal.js](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/prompt-multimodal.js) | [Raymond Camden: Multimodal Support in Chrome](https://www.raymondcamden.com/2025/05/22/multimodal-support-in-chromes-built-in-ai) | Handling image bitmaps and audio stream blobs. |
| [translation-sequential.js](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/translation-sequential.js) | [Chrome Built-in AI Getting Started](https://developer.chrome.com/docs/ai/get-started) | Queueing architecture to prevent translator thread blocking. |
| [session-compacting.js](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/session-compacting.js) | [yoichiro/zero-knowledge-pitch-builder](https://github.com/yoichiro/zero-knowledge-pitch-builder) | Listening to `contextoverflow` and auto-compressing sessions with Summarizer. |
| [demo-dashboard/](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/demo-dashboard/) | [GoogleChromeLabs/web-ai-demos](https://github.com/GoogleChromeLabs/web-ai-demos) / [chrome.dev/web-ai-demos](https://chrome.dev/web-ai-demos/) | Complete dashboard UI demonstrating features with a standard GUI. |
| [zero-knowledge-pitch-builder/](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/zero-knowledge-pitch-builder/) | [yoichiro/zero-knowledge-pitch-builder](https://github.com/yoichiro/zero-knowledge-pitch-builder) | Zero-Knowledge Business Pitch generator running parallel persona queries. |
| [insite-pagebot/](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/insite-pagebot/) | [michaelwasserman/ai-examples](https://github.com/michaelwasserman/ai-examples) | Insite AI Pagebot floating chat widget mock interface. |
| [webcam-multimodal/](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/webcam-multimodal/) | [Zenn (Finatext) Zenn Article](https://zenn.dev/finatext/articles/236a27fa78817d) | Live camera feed capturing frames for Prompt API analysis. |
| [chrome-extension/](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/chrome-extension/) | [Zenn (satetsu888) Prompt API Extension](https://zenn.dev/satetsu888/articles/chrome-prompt-api-extension) / [Romin Irani Code Explanation Extension](https://medium.com/google-cloud/chrome-built-in-ai-experiments-code-explanation-chrome-extension-16c79a092398) | Chrome MV3 Extension setup demonstrating Offscreen/Service Worker patterns. |
| [builtin-ai-api-status/](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/builtin-ai-api-status/) | [yoichiro/builtin-ai-api-status](https://github.com/yoichiro/builtin-ai-api-status) / [yoichiro/chrome-builtin-ai-api-codelab](https://github.com/yoichiro/chrome-builtin-ai-api-codelab) | Availability detection, model downloads, and status dashboard check scripts. |

---

## 2. Setting Up References (Local Setup)

The sample directories (`demo-dashboard/`, `zero-knowledge-pitch-builder/`, `insite-pagebot/`, `webcam-multimodal/`, `chrome-extension/`, `builtin-ai-api-status/`) are gitignored to keep the project repository clean of third-party copyrighted work.

To clone and download the complete original repositories for local reference, run the download script from the project root:

```bash
chmod +x .agents/skills/chrome-built-in-ai/references/download-references.sh
.agents/skills/chrome-built-in-ai/references/download-references.sh
```

Once downloaded, the subdirectories will be populated with the original repositories. The key files to reference in each project are:

*   **zero-knowledge-pitch-builder**:
    *   [index.html](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/zero-knowledge-pitch-builder/index.html) - Main user interface.
    *   [main.js](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/zero-knowledge-pitch-builder/main.js) - Prompt execution and session orchestration.
*   **builtin-ai-api-status**:
    *   [index.html](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/builtin-ai-api-status/index.html) - API capability status dashboard.
    *   [main.js](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/builtin-ai-api-status/main.js) - Parallel API loading and download progress checks.
*   **demo-dashboard**:
    *   [summarization/index.html](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/demo-dashboard/summarization/index.html) - Summarization API interactive playground.
    *   [translation/index.html](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/demo-dashboard/translation/index.html) - Translator API interface.
*   **insite-pagebot**:
    *   [pagebot.js](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/insite-pagebot/pagebot.js) - Chatbot and content extraction logic.
*   **chrome-extension**:
    *   [manifest.json](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/chrome-extension/manifest.json) - Extension configuration.
    *   [background.js](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/references/chrome-extension/background.js) - Offscreen prompt API calls.

---

## 3. Running the Demonstrations

After downloading, you can launch and test all the HTML demonstration apps locally.

### Start a Dev Server

Using Node.js:
```bash
# In the references directory:
npx serve .
```

Using Python:
```bash
python3 -m http.server 8000
```

Open your browser to `http://localhost:3000` (or `http://localhost:8000`) and navigate to the directory of the demo you wish to test. Ensure your Chrome flags are configured as specified in [SKILL.md](file:///Users/yoshimura708/code708/gdg/x-gen/.agents/skills/chrome-built-in-ai/SKILL.md).
