import type { SessionInfo, UserInputs, GeneratorStatus } from '../types';

export class XPostGeneratorCore {
  static isMobile(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod|android/.test(ua);
  }

  static normalizeStatus(raw: string): 'available' | 'downloadable' | 'downloading' | 'unavailable' {
    const map: Record<string, 'available' | 'downloadable' | 'downloading' | 'unavailable'> = {
      available:      'available',
      downloadable:   'downloadable',
      downloading:    'downloading',
      unavailable:    'unavailable',
      readily:        'available',      // legacy alias
      'after-download': 'downloadable', // legacy alias
      unsupported:    'unavailable',    // legacy alias
    };
    return map[raw] ?? 'unavailable';
  }

  static async checkAvailability(): Promise<GeneratorStatus> {
    return this.checkApiAvailability('LanguageModel');
  }

  static async checkApiAvailability(apiName: 'LanguageModel' | 'Summarizer' | 'LanguageDetector'): Promise<GeneratorStatus> {
    if (this.isMobile()) {
      return { status: 'unsupported', error: 'デスクトップ環境（Windows, macOS, Linux, Chromebook）のChromeでのみご利用いただけます。' };
    }

    const ai = (window as any);
    const hasGlobal = apiName in ai;
    const legacyMap: Record<string, string> = {
      LanguageModel: 'languageModel',
      Summarizer: 'summarizer',
      LanguageDetector: 'languageDetector'
    };
    const hasLegacy = 'ai' in ai && legacyMap[apiName] in ai.ai;

    if (!hasGlobal && !hasLegacy) {
      return { status: 'unsupported', error: `${apiName} はこのブラウザでサポートされていません。` };
    }

    try {
      let rawStatus = 'unavailable';

      if (hasGlobal) {
        rawStatus = await ai[apiName].availability();
      } else if (hasLegacy) {
        rawStatus = await ai.ai[legacyMap[apiName]].availability();
      }

      const normalized = this.normalizeStatus(rawStatus);

      if (normalized === 'available') {
        return { status: 'readily' };
      }
      if (normalized === 'downloadable') {
        return { status: 'downloadable' };
      }
      if (normalized === 'downloading') {
        return { status: 'downloading' };
      }
    } catch (e) {
      console.warn(`${apiName} availability check failed:`, e);
      return { status: 'unsupported', error: `ステータス確認エラー: ${(e as Error).message}` };
    }

    return { status: 'unsupported', error: `${apiName} モデルをご利用いただけません。` };
  }

  static async startDownload(onProgress?: (loaded: number, total: number) => void): Promise<any> {
    return this.startDownloadApi('LanguageModel', onProgress);
  }

  static async startDownloadApi(apiName: 'LanguageModel' | 'Summarizer' | 'LanguageDetector', onProgress?: (loaded: number, total: number) => void): Promise<any> {
    const ai = (window as any);
    const hasGlobal = apiName in ai;
    const legacyMap: Record<string, string> = {
      LanguageModel: 'languageModel',
      Summarizer: 'summarizer',
      LanguageDetector: 'languageDetector'
    };
    const hasLegacy = 'ai' in ai && legacyMap[apiName] in ai.ai;

    const options: any = {};
    if (onProgress) {
      options.monitor = (m: any) => {
        m.addEventListener('downloadprogress', (e: any) => {
          onProgress(e.loaded, e.total);
        });
      };
    }

    // Specifying output language constraint for LanguageModel to avoid console warnings
    if (apiName === 'LanguageModel') {
      options.expectedInputs = [{ type: 'text', languages: ['ja'] }];
      options.expectedOutputs = [{ type: 'text', languages: ['ja'] }];
    }

    if (hasGlobal) {
      return await ai[apiName].create(options);
    } else if (hasLegacy) {
      return await ai.ai[legacyMap[apiName]].create(options);
    }
    throw new Error(`${apiName} is not supported in this browser.`);
  }

  static async fetchSessionInfo(sessionId: string): Promise<SessionInfo> {
    try {
      const response = await fetch(`https://ioe-tokyo-2026.web.app/api/talks/${sessionId}.md`);
      if (!response.ok) throw new Error('セッション情報の取得に失敗しました');
      const text = await response.text();
      
      const titleMatch = text.match(/title:\s*(.*)/);
      const speakerMatch = text.match(/speaker:\s*(.*)/);
      const descriptionMatch = text.match(/description:\s*(.*)/) || text.match(/abstract:\s*(.*)/);

      return {
        id: sessionId,
        title: titleMatch ? titleMatch[1].replace(/['"]/g, '').trim() : 'Unknown Title',
        speaker: speakerMatch ? speakerMatch[1].replace(/['"]/g, '').trim() : 'Unknown Speaker',
        description: descriptionMatch ? descriptionMatch[1].replace(/['"]/g, '').trim() : ''
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async generate(
    session: SessionInfo,
    inputs: UserInputs,
    index: number,
    baseTemperature: number,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<string> {
    const availability = await this.checkAvailability();
    if (availability.status === 'unsupported') throw new Error(availability.error);

    const personalityMap = {
      engineer_logical: '客観的事実に基づき、知的な表現で簡潔にまとめるロジック重視のエンジニアトーン。感情表現は抑えめで、学びや構成を簡潔に整理します。',
      engineer_passion: '技術へのリスペクトと熱量を前面に出し、開発者コミュニティで好まれる技術用語やミーム（「完全に理解した」「何もわからない」「チョットデキル」「明日から即マージ」など）を交えた、フランクで熱気のあるトーン。',
      gal: '「〜じゃん」「〜すぎる」「マジで」などのギャル語尾を使い、最高にテンションが高いトーン。絵文字多め。',
      hotblooded: '「〜だ！」「熱すぎる！」「最高！」など、パッションと熱血漢溢れる感動MAX of MAXなトーン。',
      kansai: 'フランクで親しみやすい関西弁（〜やねん、〜やんか、など）で、ユーモアを交えたトーン。'
    };

    const situationMap = {
      pre_event: 'イベント前の事前参加表明。渋谷会場への現地参加に対するワクワク感や、注目しているセッション、楽しみなトピックへの期待値をアピールする構成。',
      attendance: 'イベント当日、会場（渋谷オフィスなど）に到着した瞬間の様子。会場の雰囲気、限定スワッグ（グッズ）獲得の喜びなど、リアルな感動を伝える構成。',
      session: 'セッション中の気づき、驚き、技術的要点をリアルタイムに実況・要約する構成。速報性を重視。',
      review: 'イベント全体の振り返り。学んだことの要点、今後の学習ロードマップ、ブログ執筆の意欲などを簡潔に整理した体系的な構成。'
    };

    // Calculate maximum body characters allowed dynamically
    // Suffix: "\n\n- [Session Title]\n#gdgtokyo #ioextended" とトグルのメタタグ
    const baseSuffix = `\n\n- ${session.title}\n#gdgtokyo #ioextended`;
    const metaSuffix = inputs.includeMeta ? ' #GeminiNano' : '';
    const fullSuffix = baseSuffix + metaSuffix;
    const maxBodyLength = Math.max(30, 140 - (fullSuffix.length + 5));

    // Slot-specific prompt modifiers to diverge generated contents
    const styleModifiers = [
      `非常に短く、要点だけを1行で伝えるトーン（全角30〜${Math.min(50, maxBodyLength)}文字程度）`,
      `フランクでキャッチーなSNSトーン（全角50〜${Math.min(70, maxBodyLength)}文字程度）`,
      `セッション内容を補足する少し説明的なトーン（全角70〜${Math.min(90, maxBodyLength)}文字程度）`,
      `熱意や学びを込めたパッション重視の長めの文面（全角80〜${maxBodyLength}文字程度）`,
      `他の参加者の共感を誘う親しみやすいトーン（全角70〜${maxBodyLength}文字程度）`
    ];
    const style = styleModifiers[index % styleModifiers.length];

    const topicPrompt = inputs.techTopic ? `\n【注目技術トピック】: ${inputs.techTopic} (このトピックを自然に投稿に含めてください)` : '';

    const context = `
      あなたは技術カンファレンス「I/O Extended Tokyo 2026」の参加者です。
      提供された情報をもとに、X（旧Twitter）向けの日本語の投稿本文を作成してください。

      【厳格な制約事項】
      - 必ず日本語で出力してください。
      - 本文の最大文字数は「全角${maxBodyLength}文字」以内とします。(絶対厳守)
      - ハッシュタグ、セッション名、URL、解説、前置きは一切含めず、純粋な「本文」のみを出力してください。
      - 表現スタイル: ${style} (絶対厳守)
      - トーン＆マナー: ${personalityMap[inputs.personality]}
      - 投稿の構成: ${situationMap[inputs.situation]}
    `;

    const fewShotExamples = `
      【出力のルール】
      ユーザーの感想メモを元に、余計な導入文なしで、以下のフォーマットのように本文だけを1パターン出力してください。

      （例1：事前参加表明の時）
      「渋谷会場の現地参加枠を確保！Chrome Built-in AIとWebMCPのセッションがめちゃくちゃ楽しみ。最新WebAIを現地でキャッチアップするぞ！」

      （例2：実況時の要約構成）
      「Gemini NanoのWebブラウザ上でのローカル動作が凄すぎる。サーバーコストゼロかつ超プライバシー保護の設計、Webの未来を感じる！」

      （例3：振り返り時の構造化）
      「I/O Extended Tokyoに参加！
      ・WebMCPによるクライアントサイドAI制御が面白い
      ・Firebase Genkit 2.0での高速開発
      明日から即プロダクションにマージして試す！」
    `;

    const prompt = `
      ${fewShotExamples}
      
      【聴講中のセッション】
      セッション名: ${session.title}
      スピーカー: ${session.speaker}
      概要: ${session.description || ''}
      ${topicPrompt}

      【ユーザーのリアルな感想メモ】
      ${inputs.feelingAndNotes || '(特になし。セッション情報とトーン指示から自動推測して作成してください)'}

      上記の情報を元に、全角${maxBodyLength}文字以内でパッションが伝わるXの投稿本文（ハッシュタグや解説は一切なし）を1パターン出力してください。
    `;

    // Vary temperature slightly per slot based on user selected base temperature (bounded between 0.1 and 2.0)
    const tempOffsets = [-0.2, 0.0, 0.2, -0.1, 0.1];
    const offset = tempOffsets[index % tempOffsets.length] ?? 0;
    const temperature = Math.max(0.1, Math.min(2.0, baseTemperature + offset));

    const ai = (window as any);
    const hasLanguageModelGlobal = 'LanguageModel' in ai;
    const hasAiLanguageModel = 'ai' in ai && 'languageModel' in ai.ai;

    const sessionOptions: any = {
      systemPrompt: context,
      temperature,
      initialPrompts: [
        { role: 'system', content: context }
      ],
      expectedInputs: [
        { type: "text", languages: ["ja"] }
      ],
      expectedOutputs: [
        { type: "text", languages: ["ja"] }
      ]
    };

    if (availability.status === 'downloadable' && onProgress) {
      sessionOptions.monitor = (m: any) => {
        m.addEventListener('downloadprogress', (e: any) => {
          onProgress(e.loaded, e.total);
        });
      };
    }

    let generatedText = '';

    if (hasLanguageModelGlobal) {
      const modelSession = await ai.LanguageModel.create(sessionOptions);
      try {
        const result = await modelSession.prompt(prompt);
        generatedText = result.trim();
      } finally {
        if (typeof modelSession.destroy === 'function') modelSession.destroy();
      }
    } else if (hasAiLanguageModel) {
      const modelSession = await ai.ai.languageModel.create(sessionOptions);
      try {
        const result = await modelSession.prompt(prompt);
        generatedText = result.trim();
      } finally {
        if (typeof modelSession.destroy === 'function') modelSession.destroy();
      }
    } else {
      throw new Error('LanguageModel is not supported in this browser.');
    }

    // Clean up any stray hashtags and wrapper quotes
    const cleanedBody = generatedText
      .replace(/#\S+/g, '')
      .replace(/^(「|『|")/, '')
      .replace(/(」|』|")$/, '')
      .trim();
    return cleanedBody + fullSuffix;
  }

  static async compress(text: string, sessionTitle: string): Promise<string> {
    const ai = (window as any);
    const hasLanguageModelGlobal = 'LanguageModel' in ai;
    const hasAiLanguageModel = 'ai' in ai && 'languageModel' in ai.ai;

    if (!hasLanguageModelGlobal && !hasAiLanguageModel) {
      throw new Error('LanguageModel is not supported in this browser.');
    }

    // Isolate post body by removing the new deterministic suffix details
    let body = text;
    const escapedTitle = sessionTitle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const fullSuffixPattern = new RegExp(`[\\s\\n]*-\\s+${escapedTitle}[\\s\\n]*#gdgtokyo\\s*#ioextended(?:\\s*#GeminiNano)?$`, 'i');
    body = body.replace(fullSuffixPattern, '').trim();
    
    // Strip any other stray hashtags
    body = body.replace(/#\S+/g, '').trim();

    // Check if the original text had #GeminiNano in it
    const hadMeta = text.includes('#GeminiNano');
    const baseSuffix = `\n\n- ${sessionTitle}\n#gdgtokyo #ioextended`;
    const metaSuffix = hadMeta ? ' #GeminiNano' : '';
    const fullSuffix = baseSuffix + metaSuffix;

    const maxBodyLength = Math.max(30, 140 - (fullSuffix.length + 5));

    const context = `
      あなたはプロのSNSライターです。
      提供されたテキストの意味やパッションを完全に維持したまま、
      全体の長さが全角${maxBodyLength}文字以内に完全に収まるよう、文章を短縮（要約）してください。
      ハッシュタグや解説、前置きは一切含めず、短縮された本文のみを出力してください。
    `;

    const prompt = `
      【短縮対象の本文】
      ${body}
    `;

    const sessionOptions: any = {
      systemPrompt: context,
      temperature: 0.6,
      initialPrompts: [
        { role: 'system', content: context }
      ],
      expectedInputs: [
        { type: "text", languages: ["ja"] }
      ],
      expectedOutputs: [
        { type: "text", languages: ["ja"] }
      ]
    };

    let compressedBody = '';

    if (hasLanguageModelGlobal) {
      const modelSession = await ai.LanguageModel.create(sessionOptions);
      try {
        const result = await modelSession.prompt(prompt);
        compressedBody = result.trim()
          .replace(/#\S+/g, '')
          .replace(/^(「|『|")/, '')
          .replace(/(」|』|")$/, '')
          .trim();
      } finally {
        if (typeof modelSession.destroy === 'function') modelSession.destroy();
      }
    } else if (hasAiLanguageModel) {
      const modelSession = await ai.ai.languageModel.create(sessionOptions);
      try {
        const result = await modelSession.prompt(prompt);
        compressedBody = result.trim()
          .replace(/#\S+/g, '')
          .replace(/^(「|『|")/, '')
          .replace(/(」|』|")$/, '')
          .trim();
      } finally {
        if (typeof modelSession.destroy === 'function') modelSession.destroy();
      }
    } else {
      throw new Error('LanguageModel is not supported in this browser.');
    }

    return compressedBody + fullSuffix;
  }

  static getXShareUrl(text: string): string {
    return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
  }
}
