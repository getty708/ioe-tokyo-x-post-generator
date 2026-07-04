/**
 * @file webcam.js
 * @description Real-time webcam frame extraction and local multimodal inference pipeline.
 * @reference https://zenn.dev/finatext/articles/236a27fa78817d
 * @license Apache-2.0
 */

import { executeMultimodalPrompt } from '../prompt-multimodal.js';

// DOM Selectors
const webcamFeed = document.getElementById('webcam-feed');
const btnStartCam = document.getElementById('btn-start-cam');
const btnAnalyzeFrame = document.getElementById('btn-analyze-frame');
const framePreview = document.getElementById('frame-preview');
const multimodalPromptInput = document.getElementById('multimodal-prompt');
const analysisOutput = document.getElementById('analysis-output');
const canvasExtract = document.getElementById('canvas-extract');

let stream = null;

// Start camera stream
btnStartCam.addEventListener('click', async () => {
  try {
    analysisOutput.textContent = 'Requesting webcam access...';
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' },
      audio: false
    });

    webcamFeed.srcObject = stream;
    btnStartCam.disabled = true;
    btnAnalyzeFrame.disabled = false;
    analysisOutput.textContent = 'Webcam successfully started. Click "Analyze Current Frame" to prompt Gemini Nano.';
  } catch (err) {
    console.error('Camera access failed:', err);
    analysisOutput.textContent = `Camera access error: ${err.message}`;
  }
});

// Capture and analyze frame
btnAnalyzeFrame.addEventListener('click', async () => {
  if (!stream) return;

  const promptText = multimodalPromptInput.value.trim() || 'Describe this image.';
  analysisOutput.textContent = 'Extracting current video frame...';

  try {
    const ctx = canvasExtract.getContext('2d');
    canvasExtract.width = webcamFeed.videoWidth || 640;
    canvasExtract.height = webcamFeed.videoHeight || 480;

    // Draw video frame to canvas
    ctx.drawImage(webcamFeed, 0, 0, canvasExtract.width, canvasExtract.height);

    // Show small thumbnail preview
    const dataUrl = canvasExtract.toDataURL('image/jpeg');
    framePreview.style.backgroundImage = `url(${dataUrl})`;
    framePreview.style.display = 'block';

    // Convert canvas content to ImageBitmap
    analysisOutput.textContent = 'Running local multimodal prompt... (This may take a moment on first execution)';
    
    // Create ImageBitmap from canvas
    const bitmap = await createImageBitmap(canvasExtract);

    // Run local multimodal inference
    const response = await executeMultimodalPrompt(bitmap, promptText, 'image');
    
    analysisOutput.textContent = response;

  } catch (err) {
    console.error('Frame analysis failed:', err);
    analysisOutput.textContent = `Multimodal Inference Failed:\n\n${err.message}\n\nEnsure Prompt API multimodal flags are enabled in chrome://flags.`;
  }
});

// Release stream when unloading page
window.addEventListener('beforeunload', () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
});
