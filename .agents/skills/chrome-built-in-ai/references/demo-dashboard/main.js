/**
 * @file main.js
 * @description Application controller for the Chrome Built-in AI Demo Dashboard.
 */

import { safeInitializeAPI } from '../feature-detection.js';
import { executePromptWithConstraints } from '../prompt-structured.js';
import { safeLanguagePipeline } from '../translation-sequential.js';
import { AutonomousDialogSession } from '../session-compacting.js';

// DOM selectors
const apiSelect = document.getElementById('api-select');
const btnDetect = document.getElementById('btn-detect');
const statusBadge = document.getElementById('status-badge');
const downloadProgressContainer = document.getElementById('download-progress-container');
const downloadLabel = document.getElementById('download-label');
const downloadProgress = document.getElementById('download-progress');

const systemContextInput = document.getElementById('system-context');
const userPromptInput = document.getElementById('user-prompt');
const jsonConstraintInput = document.getElementById('json-constraint');
const btnPromptBatch = document.getElementById('btn-prompt-batch');
const btnPromptStream = document.getElementById('btn-prompt-stream');
const promptOutput = document.getElementById('prompt-output');

const translateInputs = document.getElementById('translate-inputs');
const targetLangInput = document.getElementById('target-lang');
const btnTranslate = document.getElementById('btn-translate');
const translateOutput = document.getElementById('translate-output');

const compactChatInput = document.getElementById('compact-chat-input');
const btnCompactSend = document.getElementById('btn-compact-send');
const btnCompactClear = document.getElementById('btn-compact-clear');
const compactOutput = document.getElementById('compact-output');

const consoleLogs = document.getElementById('console-logs');

// Compacting Dialog state
let chatSession = null;

// Logger helper
function logToConsole(message, type = 'log') {
  const line = document.createElement('div');
  line.className = `console-${type}`;
  line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  consoleLogs.appendChild(line);
  consoleLogs.parentElement.scrollTop = consoleLogs.parentElement.scrollHeight;
}

// 1. Feature Detection
btnDetect.addEventListener('click', async () => {
  const targetAPI = apiSelect.value;
  statusBadge.className = 'status-badge unknown';
  statusBadge.textContent = 'Checking...';
  downloadProgressContainer.style.display = 'none';

  logToConsole(`Checking availability for ${targetAPI}...`);

  try {
    // We bind a progress listener in window
    const handleProgress = (e) => {
      const { apiName, percentage } = e.detail;
      if (apiName === targetAPI) {
        downloadProgressContainer.style.display = 'block';
        downloadLabel.textContent = `Model Download Progress: ${percentage}%`;
        downloadProgress.value = percentage;
        statusBadge.className = 'status-badge downloading';
        statusBadge.textContent = 'Downloading';
      }
    };
    window.addEventListener('ai-model-download', handleProgress);

    // Initializer
    const result = await safeInitializeAPI(targetAPI);
    logToConsole(`Successfully initialized ${targetAPI}!`, 'success');
    statusBadge.className = 'status-badge ready';
    statusBadge.textContent = 'Ready';

    // Cleanup
    if (result && typeof result.destroy === 'function') {
      result.destroy();
    }
  } catch (error) {
    logToConsole(error.message, 'error');
    statusBadge.className = 'status-badge unsupported';
    statusBadge.textContent = 'Unavailable';
  }
});

// 2. Prompt Engine
async function runPrompt(stream = false) {
  const systemContext = systemContextInput.value || 'You are a helpful assistant.';
  const userPrompt = userPromptInput.value;
  const rawSchema = jsonConstraintInput.value.trim();

  if (!userPrompt) {
    alert('Please enter a user prompt.');
    return;
  }

  let schema = null;
  if (rawSchema) {
    try {
      schema = JSON.parse(rawSchema);
    } catch (e) {
      logToConsole('Invalid JSON Schema provided.', 'error');
      alert('Invalid JSON Schema string.');
      return;
    }
  }

  promptOutput.textContent = 'Processing request...';
  logToConsole(`Prompt API: Running (${stream ? 'Streaming' : 'Batch'})...`);

  try {
    if (stream) {
      await executePromptWithConstraints(systemContext, userPrompt, schema, (chunk) => {
        promptOutput.textContent = chunk;
      });
      logToConsole('Prompt streaming completed successfully.', 'success');
    } else {
      const response = await executePromptWithConstraints(systemContext, userPrompt, schema);
      promptOutput.textContent = typeof response === 'object' 
        ? JSON.stringify(response, null, 2) 
        : response;
      logToConsole('Prompt batch execution succeeded.', 'success');
    }
  } catch (err) {
    logToConsole(`Prompt failed: ${err.message}`, 'error');
    promptOutput.textContent = `Error: ${err.message}`;
  }
}

btnPromptBatch.addEventListener('click', () => runPrompt(false));
btnPromptStream.addEventListener('click', () => runPrompt(true));

// 3. Sequential Translation
btnTranslate.addEventListener('click', async () => {
  const inputs = translateInputs.value.split('\n').filter(line => line.trim());
  const targetLanguage = targetLangInput.value.trim();

  if (!inputs.length) {
    alert('Please input at least one line of text.');
    return;
  }

  translateOutput.textContent = 'Starting translator pipeline...';
  logToConsole(`Translator: Processing ${inputs.length} blocks sequentially to target "${targetLanguage}"...`);

  try {
    const results = await safeLanguagePipeline(inputs, targetLanguage, (current, total) => {
      logToConsole(`Translated block ${current} of ${total}.`);
    });

    translateOutput.textContent = results.join('\n');
    logToConsole('Translation pipeline completed successfully.', 'success');
  } catch (err) {
    logToConsole(`Translation pipeline failed: ${err.message}`, 'error');
    translateOutput.textContent = `Error: ${err.message}`;
  }
});

// 4. Compacting Dialog Session
async function initChat() {
  if (!chatSession) {
    logToConsole('Initializing stateful Autonomous Dialog Session...');
    chatSession = new AutonomousDialogSession('You are a friendly chat companion.');
    try {
      await chatSession.initialize();
      logToConsole('Dialog session initialized.', 'success');
    } catch (e) {
      logToConsole(`Failed to start chat: ${e.message}`, 'error');
      chatSession = null;
    }
  }
}

btnCompactSend.addEventListener('click', async () => {
  const text = compactChatInput.value.trim();
  if (!text) return;

  await initChat();
  if (!chatSession) return;

  compactChatInput.value = '';
  
  // Append user message
  const userDiv = document.createElement('div');
  userDiv.innerHTML = `<strong>User:</strong> ${text}`;
  compactOutput.appendChild(userDiv);
  compactOutput.scrollTop = compactOutput.scrollHeight;

  logToConsole('Sending user message to chat session...');
  
  try {
    const reply = await chatSession.sendMessage(text);
    const replyDiv = document.createElement('div');
    replyDiv.innerHTML = `<strong>AI:</strong> ${reply}`;
    compactOutput.appendChild(replyDiv);
    compactOutput.scrollTop = compactOutput.scrollHeight;
    logToConsole('Received chat response.', 'success');
  } catch (e) {
    logToConsole(`Chat error: ${e.message}`, 'error');
    const errDiv = document.createElement('div');
    errDiv.style.color = 'var(--error)';
    errDiv.innerHTML = `<strong>Error:</strong> ${e.message}`;
    compactOutput.appendChild(errDiv);
  }
});

btnCompactClear.addEventListener('click', () => {
  if (chatSession) {
    chatSession.destroy();
    chatSession = null;
  }
  compactOutput.innerHTML = '';
  logToConsole('Chat session destroyed and history cleared.');
});
