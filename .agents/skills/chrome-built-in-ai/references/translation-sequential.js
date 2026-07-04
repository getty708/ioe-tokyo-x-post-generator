/**
 * @file translation-sequential.js
 * @description Safe Translator/Detector sequential pipeline preventing thread blocking and worker limitations.
 * @reference https://developer.chrome.com/docs/ai/get-started
 * @license Apache-2.0
 */

/**
 * Feeds an array of text strings through a sequential translation pipeline.
 * Detects the language of each text block and translates it if it differs from targetLanguage.
 * 
 * NOTE: Translator/LanguageDetector APIs must run on the main thread (not Web Workers) due to Document permissions.
 * 
 * @param {string[]} textArray Array of text strings to process.
 * @param {string} [targetLanguage='ja'] Language code to translate into.
 * @param {Function} [onProgress=null] Callback function(currentIndex, totalCount) called as translation proceeds.
 * @returns {Promise<string[]>} Array of translated (or skipped) text strings in order.
 */
export async function safeLanguagePipeline(textArray, targetLanguage = 'ja', onProgress = null) {
  if (!self.translation || !self.translation.languageDetector || !self.translation.translator) {
    throw new Error('Required Built-in translation/detection APIs are missing in this browser.');
  }

  const results = [];

  // Create Language Detector instance
  const detector = await self.translation.languageDetector.create();

  try {
    for (let i = 0; i < textArray.length; i++) {
      const originalText = textArray[i].trim();

      if (!originalText) {
        results.push('');
        continue;
      }

      // 1. Language Detection
      const detectionResults = await detector.detect(originalText);
      const topResult = detectionResults[0];
      const sourceLanguage = (topResult && topResult.confidence > 0.6)
        ? topResult.detectedLanguage
        : 'en'; // default fallback for ambiguous texts

      // Skip translation if it matches targetLanguage
      if (sourceLanguage === targetLanguage) {
        results.push(originalText);
        if (onProgress) onProgress(i + 1, textArray.length);
        continue;
      }

      // 2. Pair capability verification
      const pairStatus = await self.translation.translator.availability({
        sourceLanguage,
        targetLanguage
      });

      if (pairStatus === 'unavailable') {
        console.warn(`[Translator Pipeline] Language pair ${sourceLanguage} -> ${targetLanguage} is unsupported.`);
        results.push(originalText); // Bypass/keep original
        if (onProgress) onProgress(i + 1, textArray.length);
        continue;
      }

      // 3. Sequential Translation (create, translate, destroy per chunk to avoid thread blocks & memory leaks)
      let translator = null;
      try {
        if (pairStatus === 'downloadable') {
          console.log(`[Translator Pipeline] Downloading pack for ${sourceLanguage} -> ${targetLanguage}...`);
        }
        translator = await self.translation.translator.create({
          sourceLanguage,
          targetLanguage
        });

        const translatedText = await translator.translate(originalText);
        results.push(translatedText);
      } catch (err) {
        console.error(`[Translator Pipeline] Failed to translate item ${i}:`, err);
        results.push(originalText); // Fallback
      } finally {
        if (translator && typeof translator.destroy === 'function') {
          translator.destroy();
        }
      }

      if (onProgress) {
        onProgress(i + 1, textArray.length);
      }
    }
    return results;
  } finally {
    if (detector && typeof detector.destroy === 'function') {
      detector.destroy();
    }
  }
}
