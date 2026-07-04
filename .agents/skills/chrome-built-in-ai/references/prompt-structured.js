/**
 * @file prompt-structured.js
 * @description Executing Prompt API calls with structured JSON output constraints and abort controller lifecycle management.
 * @reference https://github.com/ahmadalfy/chrome-ai-features-demo
 * @license MIT
 */

/**
 * Executes a Prompt API call with system contexts, structured JSON outputs, and cancellation control.
 * 
 * @param {string} systemContext The instructions defining the AI role/actions.
 * @param {string} userPrompt The prompt provided by the user.
 * @param {Object} [schema=null] The JSON Schema object to constraint the output.
 * @param {Function} [onChunk=null] Callback for streaming text. If null, executes batch prompt.
 * @returns {Promise<Object|string>} Returns parsed JSON object (if schema is provided and batch) or raw text.
 */
export async function executePromptWithConstraints(systemContext, userPrompt, schema = null, onChunk = null) {
  const controller = new AbortController();
  const { signal } = controller;

  if (!self.ai || !self.ai.languageModel) {
    throw new Error('Prompt API is not supported in this browser environment. Ensure self.ai.languageModel exists.');
  }

  // 1. Gather default parameters if available (params() is standard in newer Prompt API specs)
  let modelParams = {};
  if (typeof self.ai.languageModel.params === 'function') {
    try {
      const globalParams = await self.ai.languageModel.params();
      modelParams = {
        temperature: Math.min(globalParams.defaultTemperature * 1.1, globalParams.maxTemperature),
        topK: globalParams.defaultTopK
      };
    } catch (e) {
      console.warn('[Prompt Engine] Could not load model parameters, using defaults.', e);
    }
  }

  // 2. Establish session (Binds system instructions at creation to optimize context parsing)
  const session = await self.ai.languageModel.create({
    ...modelParams,
    systemPrompt: systemContext, // Newer specifications use systemPrompt config
    // Legacy support fallback
    initialPrompts: [
      { role: 'system', content: systemContext }
    ],
    signal
  });

  try {
    const promptOptions = { signal };

    // 3. Inject structural schema constraints if requested
    if (schema) {
      promptOptions.responseConstraint = {
        type: 'json',
        schema: schema
      };
      // Suppress sending full schema over the prompt token context if supported
      promptOptions.omitResponseConstraintInput = true;
    }

    if (onChunk) {
      // Streaming implementation
      const stream = session.promptStreaming(userPrompt, promptOptions);
      let cumulativeText = '';
      for await (const chunk of stream) {
        cumulativeText = chunk; // In Built-in AI promptStreaming, chunks are accumulated full texts
        onChunk(cumulativeText);
      }
      return cumulativeText;
    } else {
      // Single batch prompt response
      const rawResponse = await session.prompt(userPrompt, promptOptions);
      if (schema) {
        try {
          return JSON.parse(rawResponse);
        } catch (parseError) {
          console.error('[Prompt Engine] JSON parsing failed for response:', rawResponse);
          throw new Error('JSON_PARSE_FAILED: Response did not conform to schema.');
        }
      }
      return rawResponse;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('[Prompt Engine] Request was explicitly aborted.');
    }
    throw error;
  } finally {
    // 4. Release GPU/system memory allocation immediately
    if (typeof session.destroy === 'function') {
      session.destroy();
    }
  }
}
