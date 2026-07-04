/**
 * @file pagebot.js
 * @description Floating chatbot logic demonstrating composite Summarizer and Prompt API local execution.
 * @reference https://github.com/michaelwasserman/ai-examples
 * @license Apache-2.0
 */

// DOM Selectors
const botToggleBtn = document.getElementById('bot-toggle-btn');
const botCloseBtn = document.getElementById('bot-close-btn');
const pagebotWidget = document.getElementById('pagebot-widget');
const botMessages = document.getElementById('bot-messages');
const botInitMsg = document.getElementById('bot-init-msg');
const botInputField = document.getElementById('bot-input-field');
const botSendBtn = document.getElementById('bot-send-btn');
const pageContentEl = document.getElementById('page-content');

let chatSession = null;
let pageText = '';

// Toggle Widget open/closed
botToggleBtn.addEventListener('click', () => {
  pagebotWidget.classList.remove('closed');
  botToggleBtn.classList.add('hidden');
  initPagebot();
});

botCloseBtn.addEventListener('click', () => {
  pagebotWidget.classList.add('closed');
  botToggleBtn.classList.remove('hidden');
});

// Appends message to chat log
function appendMessage(text, sender) {
  const div = document.createElement('div');
  div.className = `message ${sender}`;
  div.textContent = text;
  botMessages.appendChild(div);
  botMessages.scrollTop = botMessages.scrollHeight;
}

// Main logic
async function initPagebot() {
  if (pageText) return; // Already initialized

  // Get raw article content
  pageText = pageContentEl.innerText || pageContentEl.textContent;

  botInitMsg.textContent = 'Analyzing page content...';

  // 1. Check API availability
  if (!self.ai || !self.ai.summarizer || !self.ai.languageModel) {
    botInitMsg.textContent = 'Error: Built-in AI APIs (Summarizer or LanguageModel) are not supported or enabled in this browser.';
    botInitMsg.style.color = '#ef4444';
    return;
  }

  try {
    // 2. Generate Page Summary using Summarizer API
    const summarizer = await self.ai.summarizer.create({
      type: 'key-points',
      length: 'short',
      preference: 'speed'
    });

    const summary = await summarizer.summarize(pageText);
    summarizer.destroy(); // Destroy immediately to release memory

    botInitMsg.innerHTML = `<strong>Page Summary:</strong><br>${summary.replace(/\n/g, '<br>')}`;

    // 3. Setup Prompt API Chat Session with page content as context
    const systemPrompt = `You are a helpful assistant reading the current webpage. Answer questions based only on this article content:
---
${pageText}
---
Keep your responses helpful, concise, and focused on the article.`;

    chatSession = await self.ai.languageModel.create({
      systemPrompt: systemPrompt,
      initialPrompts: [{ role: 'system', content: systemPrompt }]
    });

  } catch (err) {
    console.error('Failed to initialize Pagebot:', err);
    botInitMsg.textContent = `Failed to initialize Assistant: ${err.message}`;
    botInitMsg.style.color = '#ef4444';
  }
}

// Send user question
async function handleSend() {
  const question = botInputField.value.trim();
  if (!question) return;

  if (!chatSession) {
    alert('Assistant session is not initialized yet.');
    return;
  }

  appendMessage(question, 'user');
  botInputField.value = '';

  const botMsgDiv = document.createElement('div');
  botMsgDiv.className = 'message bot';
  botMsgDiv.textContent = 'Thinking...';
  botMessages.appendChild(botMsgDiv);
  botMessages.scrollTop = botMessages.scrollHeight;

  try {
    const reply = await chatSession.prompt(question);
    botMsgDiv.textContent = reply;
  } catch (err) {
    console.error('Chat session error:', err);
    botMsgDiv.textContent = `Error: ${err.message}`;
    botMsgDiv.style.color = '#ef4444';
  }
}

botSendBtn.addEventListener('click', handleSend);
botInputField.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSend();
});

// Destroy model allocation when unloading page
window.addEventListener('beforeunload', () => {
  if (chatSession && typeof chatSession.destroy === 'function') {
    chatSession.destroy();
  }
});
