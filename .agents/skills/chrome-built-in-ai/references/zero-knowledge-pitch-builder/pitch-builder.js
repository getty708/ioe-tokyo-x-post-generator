/**
 * @file pitch-builder.js
 * @description Zero-Knowledge Pitch Builder logic using Chrome's Prompt API to run multi-persona pipelines.
 * @reference https://github.com/yoichiro/zero-knowledge-pitch-builder
 * @license Apache-2.0
 */

// Core system prompts for each of the 6 parts
const promptsConfig = {
  hook: {
    system: "You are a marketing strategist. Your task is to extract or write a catchy, 1-sentence hook based on the provided brainstorm notes. The hook must grab the audience's attention instantly.",
    label: "Hook"
  },
  problem: {
    system: "You are a product manager. Your task is to identify and concisely describe the core problem being solved from the brainstorm notes. Keep it within 2-3 sentences.",
    label: "Problem"
  },
  solution: {
    system: "You are a product designer. Your task is to explain the proposed solution based on the brainstorm notes. Keep it concise, 2-3 sentences max.",
    label: "Solution"
  },
  value: {
    system: "You are a business developer. Your task is to write a compelling value proposition statement explaining the primary benefit of the solution. 1-2 sentences.",
    label: "Value Proposition"
  },
  competitors: {
    system: "You are a market analyst. Your task is to list potential alternative products, competitors, or alternative methods mentioned or implied in the notes. Bullet points.",
    label: "Competitors"
  },
  diff: {
    system: "You are a strategist. Your task is to extract the unique differentiators or unfair advantages of this idea compared to competitors. 2 sentences.",
    label: "Differentiators"
  }
};

// Persona reviewers configuration
const reviewConfig = {
  vc: "You are a critical Venture Capitalist (VC) checking market size, monetization viability, scalability, and return on investment. Write a brief 2-sentence critique.",
  executive: "You are a conservative Corporate Executive checking integration ease, cost effectiveness, security, and immediate business value. Write a brief 2-sentence critique.",
  consumer: "You are a typical Target Consumer checking if this product actually solves a painful problem for you, if it looks easy to use, and if you would buy it. Write a brief 2-sentence critique."
};

// DOM selectors
const brainstormInput = document.getElementById('brainstorm-input');
const btnGenerate = document.getElementById('btn-generate');
const progressContainer = document.getElementById('progress-container');
const progressFill = document.getElementById('progress-fill');
const compiledPitchText = document.getElementById('compiled-pitch');

// UI Status indicators
function setCardStatus(part, status, content = '') {
  const card = document.getElementById(`card-${part}`);
  const statusEl = document.getElementById(`status-${part}`);
  const contentEl = document.getElementById(`content-${part}`);

  if (card && statusEl && contentEl) {
    card.className = `section-card ${status}`;
    statusEl.textContent = status.toUpperCase();
    if (content) {
      contentEl.textContent = content;
    }
  }
}

// Generate single section using Prompt API
async function generateSection(part, brainstormText) {
  setCardStatus(part, 'active');
  
  if (!self.ai || !self.ai.languageModel) {
    throw new Error('Prompt API is not supported in this browser.');
  }

  const config = promptsConfig[part];
  const session = await self.ai.languageModel.create({
    systemPrompt: config.system,
    // Fallback for legacy specs
    initialPrompts: [{ role: 'system', content: config.system }]
  });

  try {
    const response = await session.prompt(brainstormText);
    setCardStatus(part, 'done', response);
    return response;
  } finally {
    if (typeof session.destroy === 'function') {
      session.destroy();
    }
  }
}

// Run review persona using Prompt API
async function generateReview(persona, pitchText) {
  const systemPrompt = reviewConfig[persona];
  const session = await self.ai.languageModel.create({
    systemPrompt: systemPrompt,
    initialPrompts: [{ role: 'system', content: systemPrompt }]
  });

  try {
    const response = await session.prompt(`Review this business pitch:\n\n${pitchText}`);
    document.getElementById(`review-${persona}`).textContent = response;
  } catch (err) {
    console.error(`Failed review for ${persona}:`, err);
    document.getElementById(`review-${persona}`).textContent = `Error: ${err.message}`;
  } finally {
    if (typeof session.destroy === 'function') {
      session.destroy();
    }
  }
}

btnGenerate.addEventListener('click', async () => {
  const text = brainstormInput.value.trim();
  if (!text) {
    alert('Please enter some brainstorming notes first.');
    return;
  }

  btnGenerate.disabled = true;
  progressContainer.style.display = 'block';
  progressFill.style.width = '0%';
  compiledPitchText.textContent = 'Generating pitch sections...';

  // Initialize UI status
  Object.keys(promptsConfig).forEach(part => setCardStatus(part, 'idle', '-'));
  document.getElementById('review-vc').textContent = 'Awaiting pitch compilation...';
  document.getElementById('review-executive').textContent = 'Awaiting pitch compilation...';
  document.getElementById('review-consumer').textContent = 'Awaiting pitch compilation...';

  const results = {};
  const steps = Object.keys(promptsConfig);

  try {
    // 1. Run 6-Step Extraction Pipeline Sequentially to avoid thread contention
    for (let i = 0; i < steps.length; i++) {
      const part = steps[i];
      const res = await generateSection(part, text);
      results[part] = res;
      progressFill.style.width = `${((i + 1) / steps.length) * 50}%`; // First 50% for pitch extraction
    }

    // 2. Assemble and Display Compiled Pitch
    const compiledHtml = `
<strong>${results.hook}</strong>

<strong>The Problem:</strong> ${results.problem}

<strong>Our Solution:</strong> ${results.solution}

<strong>Why it Matters:</strong> ${results.value}

<strong>The Landscape:</strong> ${results.competitors}

<strong>Our Edge:</strong> ${results.diff}
    `;
    compiledPitchText.innerHTML = compiledHtml;
    progressFill.style.width = '60%';

    // 3. Run Virtual Persona Reviews (run in parallel/sequence)
    compiledPitchText.parentElement.scrollTop = 0;
    
    logInfo('Running persona reviews...');
    const pitchPlainText = `
Hook: ${results.hook}
Problem: ${results.problem}
Solution: ${results.solution}
Value Proposition: ${results.value}
Competitors: ${results.competitors}
Differentiators: ${results.diff}
    `;

    await generateReview('vc', pitchPlainText);
    progressFill.style.width = '75%';

    await generateReview('executive', pitchPlainText);
    progressFill.style.width = '90%';

    await generateReview('consumer', pitchPlainText);
    progressFill.style.width = '100%';

    logInfo('Pitch build successfully completed!', true);
  } catch (error) {
    console.error('Pitch creation failed:', error);
    compiledPitchText.textContent = `Error compiling pitch: ${error.message}`;
    logInfo(`Error: ${error.message}`, false, true);
  } finally {
    btnGenerate.disabled = false;
    setTimeout(() => {
      progressContainer.style.display = 'none';
    }, 1500);
  }
});

function logInfo(msg, isSuccess = false, isError = false) {
  console.log(`[Pitch Builder] ${msg}`);
}
