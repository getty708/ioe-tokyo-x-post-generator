/**
 * @file session-compacting.js
 * @description Long-lived dialog session manager that automatically compresses context when token usage limits are reached.
 * @reference https://github.com/yoichiro/zero-knowledge-pitch-builder
 * @license Apache-2.0
 */

/**
 * Manages an on-device stateful Gemini Nano chat session.
 * Tracks usage, listens to contextoverflow, and automatically compresses context using Summarizer API when limits are reached.
 */
export class AutonomousDialogSession {
  /**
   * @param {string} systemPrompt The base system context instructions.
   */
  constructor(systemPrompt) {
    this.systemPrompt = systemPrompt;
    this.session = null;
    this.fullHistory = []; // Permanent conversation audit history
    this.compactedSeedPrompts = []; // Compacted history passed as initial prompts
  }

  /**
   * Initializes a fresh stateful language model session using seed prompts and binds event listeners.
   */
  async initialize() {
    if (!self.ai || !self.ai.languageModel) {
      throw new Error('Prompt API is not supported in this browser.');
    }

    if (this.session) {
      this.session.destroy();
    }

    // Build initial prompts array
    const initialPrompts = [
      { role: 'system', content: this.systemPrompt },
      ...this.compactedSeedPrompts
    ];

    console.log(`[Dialog Session] Starting new session with ${initialPrompts.length} prompt entries...`);

    this.session = await self.ai.languageModel.create({
      initialPrompts: initialPrompts
    });

    // Handle overflow event if model fires it
    this.session.addEventListener('contextoverflow', async () => {
      console.warn('[Dialog Session] Context overflow warning received. Compressing dialog history...');
      await this.compactConversationHistory();
    });
  }

  /**
   * Sends a message to the active session and saves the output.
   * Compresses dialog on QuotaExceededError or when token thresholds are reached.
   * 
   * @param {string} userInput User input text.
   * @returns {Promise<string>} The assistant response.
   */
  async sendMessage(userInput) {
    if (!this.session) {
      await this.initialize();
    }

    this.fullHistory.push({ role: 'user', content: userInput });

    try {
      const response = await this.session.prompt(userInput);
      this.fullHistory.push({ role: 'assistant', content: response });

      // Log context window usage ratio if properties exist in this Chrome version
      if (this.session.contextUsage !== undefined && this.session.contextWindow !== undefined) {
        const usagePercent = ((this.session.contextUsage / this.session.contextWindow) * 100).toFixed(1);
        console.log(`[Context Ratio] Usage: ${this.session.contextUsage} / ${this.session.contextWindow} (${usagePercent}%)`);

        // Proactive compression if we exceed 85% context usage
        if (this.session.contextUsage / this.session.contextWindow > 0.85) {
          console.log('[Dialog Session] Token threshold (85%) reached. Initiating proactive compression.');
          await this.compactConversationHistory();
        }
      }

      return response;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('[Dialog Session] Token quota limit exceeded! Forcing prompt history compaction...');
        await this.compactConversationHistory();
        return await this.sendMessage(userInput); // Retry message after compaction
      }
      throw error;
    }
  }

  /**
   * Compresses the conversation history by passing user and assistant messages
   * to the Summarizer API (using "speed" preference) and rebuilding the session.
   */
  async compactConversationHistory() {
    console.log('[Compactor] Starting compression pipeline...');
    
    if (!self.ai || !self.ai.summarizer || !self.ai.languageDetector) {
      console.warn('[Compactor] Summarizer or LanguageDetector APIs are missing. Hard-clearing session history instead.');
      this.compactedSeedPrompts = [];
      await this.initialize();
      return;
    }

    const detector = await self.ai.languageDetector.create();
    const compactedResults = [];

    try {
      for (const msg of this.fullHistory) {
        // Skip compacting technical code definitions or formats to keep them intact
        if (msg.content.includes('```')) {
          compactedResults.push({ role: msg.role, content: msg.content });
          continue;
        }

        // Detect language of this chat turn
        const detection = await detector.detect(msg.content);
        const topLanguage = detection[0] ? detection[0].detectedLanguage : 'en';

        // Initialize summarizer using fast TLDR settings
        const summarizer = await self.ai.summarizer.create({
          type: 'tldr',
          format: 'plain-text',
          length: 'short',
          preference: 'speed',
          expectedInputLanguages: [topLanguage],
          outputLanguage: topLanguage
        });

        try {
          const summary = await summarizer.summarize(msg.content, {
            context: `Compact history of turn by ${msg.role}`
          });
          
          compactedResults.push({
            role: msg.role,
            content: summary.length < msg.content.length ? summary : msg.content
          });
        } catch (summarizeErr) {
          console.error('[Compactor] Failed turn summarization:', summarizeErr);
          compactedResults.push(msg); // fallback to original
        } finally {
          summarizer.destroy();
        }
      }
    } finally {
      detector.destroy();
    }

    // Set compacted entries as session base and refresh the model
    this.compactedSeedPrompts = compactedResults;
    await this.initialize();
    console.log('[Compactor] Compaction successfully finalized.');
  }

  /**
   * Clones the current active session state for parallel execution/branching dialogs.
   * @returns {Promise<Object>} Cloned session.
   */
  async cloneSession() {
    if (!this.session) {
      throw new Error('No active session state to clone.');
    }
    return await this.session.clone();
  }

  /**
   * Destroys active session resource allocations.
   */
  destroy() {
    if (this.session) {
      this.session.destroy();
      this.session = null;
    }
  }
}
