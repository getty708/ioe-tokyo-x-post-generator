# Built-in AI Status Checker and Codelab Mock

This sample code demonstrates the modern GA (General Availability) check flow for Chrome's Built-in AI APIs.

## Attribution and Source Mapping

* **Original Source**: Community reference implementations by Yoichiro Tanaka (@yoichiro).
* **Reference URLs**:
  * [yoichiro/builtin-ai-api-status](https://github.com/yoichiro/builtin-ai-api-status)
  * [yoichiro/chrome-builtin-ai-api-codelab](https://github.com/yoichiro/chrome-builtin-ai-api-codelab)
  * [Demo Site](https://builtin-ai-api-status.yoichiro.dev/)

## Contents

- [checker.js](./checker.js): Normalized helper methods for checking API availability status. Prioritizes constructors directly on the global scope (`LanguageModel`, `Summarizer`, etc.).
- [main.js](./main.js): Demonstrates parallel loading of multiple on-device AI instances starting from a single user gesture, tracking download progress.
