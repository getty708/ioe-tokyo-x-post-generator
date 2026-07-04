// =============================================================================
// Chrome Built-in AI API Codelab - メインスクリプト
// =============================================================================

const startButton = document.getElementById("start-button");
const downloadingMessage = document.getElementById("downloading-message");
const downloadProgress = document.getElementById("download-progress");
const mainContent = document.getElementById("main-content");
const inputMessage = document.getElementById("input-message");
const formatButton = document.getElementById("format-button");
const businessMessage = document.getElementById("business-message");
const outputMessage = document.getElementById("output-message");
const analyzeButton = document.getElementById("analyze-button");
const summaryResult = document.getElementById("summary-result");
const emotionResult = document.getElementById("emotion-result");

let summarizer;
let languageDetector;
let translatorEnJa;
let languageModel;

const progresses = [0, 0, 0, 0];

const updateProgress = () => {
  const average = progresses.reduce((sum, p) => sum + p, 0) / progresses.length;
  downloadProgress.textContent = (average * 100).toFixed(0);
};

const makeMonitor = (index) => (m) => {
  m.addEventListener("downloadprogress", (e) => {
    progresses[index] = e.loaded;
    updateProgress();
  });
};

const withLoading = async (button, loadingLabel, fn) => {
  const original = button.textContent;
  button.disabled = true;
  button.textContent = loadingLabel;
  try {
    await fn();
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
};

const initializeInstances = async () => {
  [summarizer, languageDetector, translatorEnJa, languageModel] =
    await Promise.all([
      Summarizer.create({
        type: "key-points",
        expectedInputLanguages: ["ja"],
        outputLanguage: "ja",
        monitor: makeMonitor(0),
      }),
      LanguageDetector.create({ monitor: makeMonitor(1) }),
      Translator.create({
        sourceLanguage: "en",
        targetLanguage: "ja",
        monitor: makeMonitor(2),
      }),
      LanguageModel.create({ monitor: makeMonitor(3) }),
    ]);
};

if (startButton) {
  startButton.addEventListener("click", async () => {
    startButton.hidden = true;
    if (downloadingMessage) downloadingMessage.hidden = false;
    await initializeInstances();
    if (downloadingMessage) downloadingMessage.hidden = true;
    if (mainContent) mainContent.hidden = false;
  });
}

if (formatButton) {
  formatButton.addEventListener("click", () =>
    withLoading(formatButton, "変換中", async () => {
      businessMessage.value = "";
      const receivedText = outputMessage.value.trim();
      const prompt = receivedText
        ? `以下に示す「受信メッセージ」に対する返信として、「返信メッセージ」をビジネス文書としてふさわしい丁寧な日本語の文面に書き直してください。書き直した返信文のみを出力し、説明や前置きは不要です。

受信メッセージ:
${receivedText}

返信メッセージ:
${inputMessage.value}`
        : `次のメッセージを、ビジネス文書としてふさわしい丁寧な日本語の文面に書き直してください。書き直した文面のみを出力し、説明や前置きは不要です。

メッセージ:
${inputMessage.value}`;

      businessMessage.value = await languageModel.prompt(prompt);
    }),
  );
}

if (analyzeButton) {
  analyzeButton.addEventListener("click", () =>
    withLoading(analyzeButton, "解析中", async () => {
      summaryResult.value = "";
      emotionResult.textContent = "";
      const received = outputMessage.value;
      let text = received;

      const [topResult] = await languageDetector.detect(text);
      if (topResult.detectedLanguage === "en") {
        text = await translatorEnJa.translate(text);
      }

      const emotionPrompt = `以下のメッセージから読み取れる送信者の感情を、絵文字一文字だけで表現してください。

例: 😊 / 😢 / 😡 / 😴 / 😐 / 🤔 / 😍 / 😨

絵文字のみを出力し、説明や記号、空白、改行は一切含めないでください。

メッセージ:
${received}`;

      const [summary, emotion] = await Promise.all([
        summarizer.summarize(text),
        languageModel.prompt(emotionPrompt),
      ]);

      summaryResult.value = summary;
      emotionResult.textContent = emotion.trim();
    }),
  );
}

(async () => {
  if (typeof Summarizer === 'undefined' || typeof LanguageDetector === 'undefined' || typeof Translator === 'undefined' || typeof LanguageModel === 'undefined') {
    return;
  }
  try {
    const availabilities = await Promise.all([
      Summarizer.availability({
        expectedInputLanguages: ["ja"],
        outputLanguage: "ja",
      }),
      LanguageDetector.availability(),
      Translator.availability({ sourceLanguage: "en", targetLanguage: "ja" }),
      LanguageModel.availability(),
    ]);

    const allAvailable = availabilities.every((a) => a === "available" || a === "readily");

    if (allAvailable) {
      await initializeInstances();
      if (mainContent) mainContent.hidden = false;
    } else {
      if (startButton) startButton.hidden = false;
    }
  } catch (e) {
    console.error("Initialization failed:", e);
  }
})();
