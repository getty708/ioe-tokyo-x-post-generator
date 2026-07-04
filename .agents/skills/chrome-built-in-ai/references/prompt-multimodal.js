/**
 * @file prompt-multimodal.js
 * @description Local multimodal inferences passing ImageBitmap elements or audio binary buffers to the Prompt API.
 * @reference https://www.raymondcamden.com/2025/05/22/multimodal-support-in-chromes-built-in-ai
 * @license Apache-2.0
 */

/**
 * Executes a multimodal prompt targeting local image or audio analysis.
 * 
 * @param {Blob|File|ImageBitmap} file The source media file.
 * @param {string} promptText The question/instructions to send with the media.
 * @param {string} [fileType='image'] The type of media content ('image' or 'audio').
 * @returns {Promise<string>} The textual response from the model.
 */
export async function executeMultimodalPrompt(file, promptText, fileType = 'image') {
  if (!self.ai || !self.ai.languageModel) {
    throw new Error('Multimodal Prompt API is not supported in this browser.');
  }

  // 1. Establish the session specifying multimodal inputs
  const session = await self.ai.languageModel.create({
    // Inform model of the multimodal inputs it will consume
    expectedInputs: [
      { type: 'text', languages: ['en', 'ja'] },
      { type: fileType }
    ],
    expectedOutputs: [{ type: 'text', languages: ['en', 'ja'] }]
  });

  try {
    let mediaPayload;

    if (fileType === 'image') {
      // If image is Blob/File, convert to ImageBitmap
      if (file instanceof Blob || file instanceof File) {
        const bitmap = await createImageBitmap(file);
        mediaPayload = { type: 'image', value: bitmap };
      } else if (file instanceof ImageBitmap) {
        mediaPayload = { type: 'image', value: file };
      } else {
        throw new Error('Invalid image payload. Must be Blob, File, or ImageBitmap.');
      }
    } else if (fileType === 'audio') {
      // If audio is Blob, we pass the Blob/File directly
      if (file instanceof Blob || file instanceof File || file instanceof ArrayBuffer) {
        mediaPayload = { type: 'audio', value: file };
      } else {
        throw new Error('Invalid audio payload. Must be Blob, File, or ArrayBuffer.');
      }
    } else {
      throw new Error(`Unsupported media type for Built-in Multimodal AI: ${fileType}`);
    }

    // 2. Build the multimodal payload array and prompt the session
    const response = await session.prompt([
      {
        role: 'user',
        content: [
          { type: 'text', value: promptText },
          mediaPayload
        ]
      }
    ]);

    return response;
  } finally {
    // 3. Clean up session and free system memory resources
    if (typeof session.destroy === 'function') {
      session.destroy();
    }
  }
}
