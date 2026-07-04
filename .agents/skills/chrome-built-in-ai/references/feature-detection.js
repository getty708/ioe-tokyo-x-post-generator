/**
 * @file feature-detection.js
 * @description Safe detection, capability checks, and download monitoring for Chrome Built-in AI models.
 * @reference https://developer.chrome.com/docs/ai/get-started
 * @license Apache-2.0
 */

/**
 * Safely initializes a Built-in AI API by checking its capability, monitoring download progress,
 * and creating a session/instance.
 * 
 * @param {string} apiName The global property name of the API (e.g., 'ai', 'translation', 'summarizer').
 * @param {Object} [options={}] Initialization options passed to the api.create() method.
 * @returns {Promise<Object>} Resolves with the initialized API session or instance.
 */
export async function safeInitializeAPI(apiName, options = {}) {
  // 1. Basic interface checking (e.g., self.ai, self.translation, self.ai.summarizer)
  const apiPath = getAPIInterface(apiName);
  if (!apiPath) {
    throw new Error(`API_NOT_SUPPORTED: ${apiName} is not supported in this browser. Please check flag settings.`);
  }

  // 2. Query availability
  if (typeof apiPath.availability !== 'function') {
    throw new Error(`API_ERROR: ${apiName} does not implement availability().`);
  }

  const availability = await apiPath.availability(options);
  console.log(`[Feature Detection] ${apiName} availability status: ${availability}`);

  if (availability === 'unavailable') {
    throw new Error(`API_UNAVAILABLE: ${apiName} is unavailable due to hardware constraints or administrator policies.`);
  }

  // 3. Handle model download state
  if (availability === 'downloadable') {
    console.log(`[Feature Detection] Model for ${apiName} is downloadable. Starting download...`);
    return await apiPath.create({
      ...options,
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          const percentage = ((e.loaded / e.total) * 100).toFixed(1);
          console.log(`[Model Download] ${apiName}: ${percentage}% (${e.loaded}/${e.total} bytes)`);

          // Dispatch a custom event to notify frontend interfaces
          const progressEvent = new CustomEvent('ai-model-download', {
            detail: { apiName, percentage, loaded: e.loaded, total: e.total }
          });
          window.dispatchEvent(progressEvent);
        });
      }
    });
  }

  // 4. Readily available state
  console.log(`[Feature Detection] ${apiName} is ready. Instantiating...`);
  return await apiPath.create(options);
}

/**
 * Resolves the nested API interface based on the Chrome Built-in AI naming conventions.
 * Supports: 'ai', 'ai.summarizer', 'translation', 'ai.languageDetector', 'ai.writer', 'ai.rewriter', 'ai.proofreader', 'ai.languageModel'
 * 
 * @param {string} apiName Name of the target API.
 * @returns {Object|null} The resolved API namespace/object.
 */
function getAPIInterface(apiName) {
  const parts = apiName.split('.');
  let current = self;
  for (const part of parts) {
    if (current[part] === undefined) {
      return null;
    }
    current = current[part];
  }
  return current;
}
