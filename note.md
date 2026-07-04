Chrome Built-in AI を活用した Web アプリケーション開発のための自律エージェント向け技術仕様書および統合ガイドライン1. 自律エージェント開発環境におけるクライアントサイド AI の構造的変革ソフトウェア開発の自動化において、Codex や Antigravity CLI に代表される自律エージェントの役割は、静的なコード生成から、実行環境の制約を考慮した動的なアプリケーション設計へとシフトしている。特に、ブラウザが標準で機械学習モデルを搭載し、ローカルでの推論を可能にする Chrome Built-in AI の登場は、クライアントサイド開発の設計思想を根本から変えつつある。自律エージェントが Web アプリケーション開発を効率的かつ自律的に実行するためには、ブラウザ固有の制約、API ライフサイクル、そしてモデル管理のメカニズムを体系化した「Agent Skills」の定義が必要不可欠となる。従来のクラウド型大規模言語モデル（LLM）への依存は、API キーの管理、従量課金、およびネットワークの遅延という問題を伴っていたが、ブラウザ内蔵モデル（Gemini Nano 等）を活用することで、これらが一挙に解決される。ユーザーデータの外部送信を一切行わない「ゼロ・ナレッジ・プライバシー」の実現は、機密性の高いブレインストーミングやビジネスアイデアを取り扱うアプリケーションにおいて極めて高い付加価値を提供する。自律エージェントは、これらのデバイスローカルな推論能力を最大限に引き出すため、環境検知、非同期でのモデルロード監視、セッション管理、そしてフォールバック設計をプログラムで直接解釈可能なスキルセットとして学習・保持しなければならない。2. SKILL.md 仕様定義：自律エージェント用 API 知識インデックス自律エージェントが開発環境を自動設定し、各 API の能力と制約を正確に識別するための技術的インデックスを定義する。2.1. 動作環境要件とブラウザフラグ設定エージェントは、アプリケーションの実行に先立ち、クライアントデバイスが以下のハードウェアおよびソフトウェア要件を満たしていることを確認する必要がある。要件カテゴリ最小要件スペック補足事項・推奨事項オペレーティングシステムWindows 10/11, macOS 13+ (Ventura以降), Linux, Chromebook Plus (Platform 16389.0.0 以降)モバイル OS (Android, iOS) は現在非対応メインメモリ (RAM)最低 8 GB 以上のシステムメモリ複数セッションを同時に保持する際のパフォーマンスに影響ストレージ空き容量最低 22 GB 以上の空きディスク容量Gemini Nano 基盤モデルの初回ダウンロード用領域グラフィックス (GPU)4 GB 以上の VRAM を搭載した外部 GPU 推奨マルチモーダルにおける音声入力処理では GPU 動作が必須ローカルプロトタイピング環境において、自律エージェントが自動テストやプレビューを実行する場合、以下の Chrome フラグ（chrome://flags）を有効化するように開発環境を構成しなければならない。フラグ名 (Chrome Flags ID)推奨設定値有効化されるシステムコンポーネント#optimization-guide-on-device-modelEnabled[cite: 7, 15]基盤となるローカルオンデバイスモデル（Gemini Nano）の実行と更新管理#prompt-api-for-gemini-nanoEnabled または Enabled Multilingual[cite: 7]汎用的な Prompt API インターフェースの有効化#prompt-api-for-gemini-nano-multimodal-inputEnabled[cite: 15]Prompt API における画像および音声データの入力サポート#writer-api-for-gemini-nanoEnabled[cite: 15]執筆支援（Writer / Rewriter）および Proofreader API の有効化2.2. 主要 API の機能特性・制約マトリクスエージェントが開発時に適切な API を選択できるよう、仕様と実行時の制約を一覧化する。API 名搭載モデル種別推奨タスクセッション管理の特性Web Worker対応言語バージョン推移Prompt APIGemini Nano (汎用基盤)自由対話、独自プロンプト抽出、JSON構造化出力Stateful（対話履歴をコンテキストに保持）利用不可（拡張 Service Worker は可能）M139以前: 英語のみ / M140: 西・日追加 / M149: 英・西・日・独・仏Summarizer APIGemini Nano (チューニング済)文書圧縮、見出し・キーポイント抽出Stateless（再利用設計、コンテキスト保持なし）利用不可（ドキュメント権限チェック制限）英・西・日・独・仏Translator APIタスク専用エキスパートモデルオンデバイス双方向テキスト翻訳Stateless（シーケンシャルにキューを処理）利用不可（権限ポリシー制約）言語パックをオンデマンドで個別ダウンロードLanguage Detector APIタスク専用エキスパートモデルテキストの言語検知と信頼スコアの返却Stateless（単発呼び出し）利用不可広範な多言語に対応（個別利用可否の判定機能あり）Writer APIGemini Nano (執筆特化)下書き生成、アウトラインからの文章展開Stateless（履歴なし、同一セッション再利用推奨）利用不可（Developer Trial 現在）英・西・日Rewriter APIGemini Nano (改変特化)トーン変更（フォーマル/カジュアル）、長さ調整Stateless（履歴なし）利用不可（Developer Trial 現在）英・西・日Proofreader APIGemini Nano (校正特化)文法修正、間違いカテゴリ検知、修正理由提示Stateless（履歴なし）利用不可（Developer Trial 現在）英・西・日・独・仏2.3. 各 API 固有のパラメータおよび出力仕様2.3.1. Summarizer APISummarizer API の動作挙動は、インスタンス作成時に渡す type（要約方法）と length（出力の長さ）の組み合わせにより、明確にトークンサイズが規定される。エージェントは、以下のパラメータの定義に従って要約 UI を組み立てる必要がある。type 指定値length: shortlength: mediumlength: long"key-points"3行の箇条書き（弾丸リスト）5行の箇条書き7行の箇条書き"tldr"1文の要約3文の要約5文の要約"teaser"1文の興味を引く要約3文の興味を引く要約5文の興味を引く要約"headline"単一文（最大12単語）単一文（最大17単語）単一文（最大22単語）また、処理優先度を指示する preference パラメータは、以下の通りモデルの実行時パフォーマンスと精度のバランスを制御する。"speed": 低遅延と最速の実行を優先する。内部的には、サイズが制限された軽量なモデルバリアント、あるいは簡略化された推論アルゴリズムをロードするため、複雑な学術論文の要約などではニュアンスの抽出漏れが発生しやすくなる。"capability": 文書全体の網羅性と一貫性を優先する。高精度な処理が行われるが、遅延が長くなる傾向がある。"auto": システムのリソースや入力されたテキスト量に応じて、ブラウザが自動的にバランスを調整する。2.3.2. Proofreader APIProofreader API は、他の API とは異なり、生のテキストではなく構造化された ProofreadResult オブジェクトを返却する。返却されるデータ構造は以下の通り定義されており、エージェントはこれを利用してインタラクティブな添削 UI（スペルミス箇所のハイライトとツールチップによる理由解説など）を実装できる。JSON{
  "correctedInput": "補正が行われた後の完全なテキスト全文",
  "corrections": [
    {
      "explanation": "なぜその修正が必要であったのかを平易な言葉で説明した文章",
      "label": "エラーの種類を識別するラベル（例: grammar, spelling, punctuation）",
      "originalText": "修正前の誤っていた部分文字列",
      "correctedText": "修正後の部分文字列",
      "startIndex": 0,
      "endIndex": 12
    }
  ]
}
3. references/ 実用的なコードサンプルの設計と実装自律エージェントが開発時に直接参照し、ターゲットプロジェクトへソースコードとして書き出すための標準的なコード実装パターンを提示する。3.1. 機能検出、モデルロード、およびプライバシー配慮（references/feature-detection.js）ローカルにモデルが存在しない場合、ブラウザはバックグラウンドでマルチギガバイトのファイルをダウンロードする。エージェントが作成するコードは、このダウンロード進捗を監視し、進行状況をユーザーに通知できなければならない。また、Translator API においては、ユーザーの閲覧プライバシーを保護するため、特定の言語ペアがサポートされているかどうかの内部情報を極力隠蔽し、モデルが実際にインスタンス化されるまで一貫して "downloadable" ステータスを返す仕様になっていることを考慮する。JavaScript/**
 * クライアントの Built-in AI API の対応状況とロード状態を検証し、
 * ダウンロード進捗をフックした上で安全にインスタンスを作成する。
 */
export async function safeInitializeAPI(apiName, options = {}) {
  // 1. 基本的なインターフェースの存在確認
  if (!(apiName in self)) {
    throw new Error(`API_NOT_SUPPORTED: ${apiName} はこのブラウザでサポートされていません。`);
  }

  const apiTarget = self[apiName];

  // 2. 利用可能性（availability）のチェック
  const availability = await apiTarget.availability(options);
  console.log(`[Feature Detection] ${apiName} の状態: ${availability}`);

  if (availability === 'unavailable') {
    throw new Error(`API_UNAVAILABLE: ${apiName} はハードウェア制限またはポリシーにより利用できません。`);
  }

  // 3. ダウンロードが必要な場合、進行状況を監視してインスタンス化
  if (availability === 'downloadable') {
    return await apiTarget.create({
      ...options,
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          const percentage = ((e.loaded / e.total) * 100).toFixed(1);
          console.log(`[Model Download] ${apiName}: ${percentage}% 完了 (${e.loaded}/${e.total} bytes)`);

          // イベントをディスパッチしてフロントエンド UI と連携
          const progressEvent = new CustomEvent('ai-model-download', {
            detail: { apiName, percentage, loaded: e.loaded, total: e.total }
          });
          window.dispatchEvent(progressEvent);
        });
      }
    });
  }

  // 4. 即時利用可能な場合はそのままセッションを作成
  return await apiTarget.create(options);
}
3.2. Prompt API における構造化出力と実行中止制御（references/prompt-structured.js）Prompt API を利用する場合、エージェントは LanguageModel.params() を呼び出すことで、デフォルトのサンプリング値を取得できる（この機能は Extension 環境または Origin Trial 有効時のみ稼働する）。また、推論速度の最適化として、システムプロンプトや前提となる役割（Role）の設定は、セッション作成時に initialPrompts として静的にバインドし、初回 prompt() 呼び出し時に入力として渡さないようにする。これにより、モデルのコンテキスト処理プロセスが最適化され、初回応答の遅延が劇的に軽減される。さらに、JSON Schema（responseConstraint）を定義して厳格な構造化オブジェクトを出力させることが可能である。その際、スキーマ定義が消費するトークンを抑えるため、omitResponseConstraintInput: true を設定し、プロンプト内のテキスト指示で出力形式を補助するアプローチを併用する。JavaScript/**
 * 構造化 JSON スキーマ制約と AbortSignal によるライフサイクル管理を施した
 * 堅牢な Prompt API 実行エンジン。
 */
export async function executePromptWithConstraints(systemContext, userPrompt, schema, onChunk) {
  const controller = new AbortController();
  const { signal } = controller;

  // 1. サンプリングパラメータの取得（利用可能なコンテキスト下のみ）
  let samplingParams = {};
  if ('LanguageModel' in self && typeof LanguageModel.params === 'function') {
    try {
      const globalParams = await LanguageModel.params();
      samplingParams = {
        temperature: Math.min(globalParams.defaultTemperature * 1.1, globalParams.maxTemperature),
        topK: globalParams.defaultTopK
      };
    } catch (e) {
      console.warn('パラメータの自動取得に失敗しました。デフォルト設定を使用します。', e);
    }
  }

  // 2. セッションの確立（システム指示はセッション作成時に完全に注入）
  const session = await LanguageModel.create({
    ...samplingParams,
    initialPrompts: [
      { role: 'system', content: systemContext }
    ],
    expectedInputs: [{ type: 'text', languages: ['en', 'ja'] }],
    expectedOutputs: [{ type: 'text', languages: ['ja'] }],
    signal
  });

  try {
    const promptOptions = {
      signal,
      responseConstraint: schema,
      // スキーマ文字列をコンテキストから除外してトークン消費を抑制
      omitResponseConstraintInput: true
    };

    if (onChunk) {
      // ストリーミング返却ロジック
      const stream = session.promptStreaming(userPrompt, promptOptions);
      for await (const chunk of stream) {
        onChunk(chunk);
      }
      return null;
    } else {
      // 一括バッチ取得
      const rawResponse = await session.prompt(userPrompt, promptOptions);
      return JSON.parse(rawResponse);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('推論タスクが呼び出し元によってキャンセルされました。');
    }
    throw error;
  } finally {
    // リソースを即時解放するためセッションを明示的にクローズ
    session.destroy();
  }
}
3.3. マルチモーダル入力処理：画像と音声（references/prompt-multimodal.js）Prompt API は、テキスト情報に加えて画像および音声を含むマルチモーダルデータを直接処理する能力を備えている。画像入力では createImageBitmap を用いた入力バッファ、もしくはファイル参照オブジェクトそのものを引き渡し、音声入力では GPU ハードウェア環境の稼働を前提に、AudioBuffer や Blob を使用して入力モデルへクエリを投下する。JavaScript/**
 * 画像および音声ファイルをターゲットにしたローカルマルチモーダル推論。
 * 音声処理を実行する場合は GPU 支援が必須。
 */
export async function executeMultimodalPrompt(file, promptText, fileType = 'image') {
  // 1. 期待される入力情報の定義
  const session = await LanguageModel.create({
    expectedInputs: [
      { type: 'text', languages: ['en', 'ja'] },
      { type: fileType }
    ],
    expectedOutputs: [{ type: 'text', languages: ['en'] }]
  });

  try {
    let mediaPayload;

    if (fileType === 'image') {
      // 画像の場合: ImageBitmap にコンバート
      const bitmap = await createImageBitmap(file);
      mediaPayload = { type: 'image', value: bitmap };
    } else if (fileType === 'audio') {
      // 音声の場合: Blob、ArrayBuffer、AudioBuffer などの形式が受け入れ可能
      mediaPayload = { type: 'audio', value: file };
    } else {
      throw new Error(`Unsupported media type: ${fileType}`);
    }

    // マルチモーダル・ペイロードのアセンブリ
    const result = await session.prompt([
      {
        role: 'user',
        content: [
          { type: 'text', value: promptText },
          mediaPayload
        ]
      }
    ]);

    return result;
  } finally {
    session.destroy();
  }
}
3.4. 翻訳および言語検出のシーケンシャルパイプライン（references/translation-sequential.js）Translator API などのタスク専用エキスパートモデルは、処理要求が内部キューによりシーケンシャルに並び替えられるため、複数の大きなドキュメントを並行して投入すると、スレッドが一時的にフリーズするかブロックされる挙動を示す。これを防ぐため、エージェントは入力をチャンク単位に直列化してループ処理し、同一スレッド内での競合を排除する実装を自動生成する必要がある。また、これらの API は Web Worker 上では権限検証のためのコンテキスト（Document）が存在しないため稼働せず、同一ドメインの iframe 以外では allow="translator" などの Permissions Policy 属性を親 HTML に設定することが義務付けられている。JavaScript/**
 * 言語検出後にシーケンシャルキューを維持して翻訳を実行する。
 * Web Worker 内では動作しない制約を考慮し、メインスレッド上で実行。
 */
export async function safeLanguagePipeline(textArray, targetLanguage = 'ja', onProgress) {
  if (!('LanguageDetector' in self) || !('Translator' in self)) {
    throw new Error('必要な内蔵タスク API がブラウザ環境に見つかりません。');
  }

  const results = [];
  const detector = await LanguageDetector.create();

  try {
    for (let i = 0; i < textArray.length; i++) {
      const originalText = textArray[i];

      // 1. 言語検出の実施
      const detection = await detector.detect(originalText);
      const sourceLanguage = (detection.length > 0 && detection[0].confidence > 0.6)
        ? detection[0].detectedLanguage
        : 'en'; // 信頼度不足の場合はデフォルトフォールバック

      if (sourceLanguage === targetLanguage) {
        results.push(originalText);
        continue;
      }

      // 2. 言語ペアのサポートチェックと翻訳モデルの作成
      const isTranslatable = await Translator.availability({ sourceLanguage, targetLanguage });
      if (isTranslatable === 'unavailable') {
        console.warn(`翻訳の不整合: ${sourceLanguage} から ${targetLanguage} への変換はサポートされていません。`);
        results.push(originalText); // 変換せずスルー
        continue;
      }

      // 3. 直列（シーケンシャル）な翻訳実行
      const translator = await Translator.create({ sourceLanguage, targetLanguage });
      try {
        const translatedText = await translator.translate(originalText);
        results.push(translatedText);
      } finally {
        translator.destroy(); // キュー詰まりとリークを防止するため、都度確実に破壊
      }

      if (onProgress) {
        onProgress(i + 1, textArray.length);
      }
    }
    return results;
  } finally {
    detector.destroy();
  }
}
3.5. トークン枯渇を回避するセッション自動圧縮処理（references/session-compacting.js）対話セッションが長くなると、モデルのコンテキスト制限（contextWindow）を超過し、過去のコンテキストが自動的に破棄されて対話品質が低下するか、最悪の場合は QuotaExceededError が発生して推論が完全に停止する。エージェントは、contextoverflow イベントを監視して検知したタイミング、あるいは事前に計算した閾値に達した段階で、Summarizer API（低遅延を誇る preference: "speed"）を呼び出して会話履歴を自律圧縮し、新しいセッションの initialPrompts として再生させるロジックをインポートしなければならない。JavaScript/**
 * 会話履歴の自己圧縮機能を備えた状態持続型 AI ダイアログセッション。
 */
export class AutonomousDialogSession {
  constructor(systemPrompt) {
    this.systemPrompt = systemPrompt;
    this.session = null;
    this.fullHistory = []; // ログおよびリカバリ用の完全履歴 [cite: 26]
    this.compactedSeedPrompts = []; // 要約されたシード履歴
  }

  async initialize() {
    // 既存セッションの破棄
    if (this.session) {
      this.session.destroy();
    }

    // 圧縮されたプロンプト履歴を用いてクリーンなセッションを開始
    this.session = await LanguageModel.create({
      initialPrompts: [
        { role: 'system', content: this.systemPrompt },
        ...this.compactedSeedPrompts
      ]
    });

    // コンテキストオーバーフロー警告をサブスクライブ
    this.session.addEventListener('contextoverflow', async () => {
      console.warn('[Session Compactor] オーバーフローが検知されました。履歴の圧縮を開始します。');
      await this.compactConversationHistory();
    });
  }

  async sendMessage(userInput) {
    if (!this.session) await this.initialize();

    this.fullHistory.push({ role: 'user', content: userInput });

    try {
      const response = await this.session.prompt(userInput);
      this.fullHistory.push({ role: 'assistant', content: response });

      // 使用トークン比率のロギング
      const usagePercent = ((this.session.contextUsage / this.session.contextWindow) * 100).toFixed(1);
      console.log(`[Context Ratio] ${this.session.contextUsage} / ${this.session.contextWindow} (${usagePercent}%)`);

      return response;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        console.error('[Session Error] クォータの上限を超過しました。強制圧縮を試みます。');
        await this.compactConversationHistory();
        return await this.sendMessage(userInput); // 再試行
      }
      throw e;
    }
  }

  async compactConversationHistory() {
    console.log('[Compaction Pipeline] 現在の会話レコードを縮小中...');
    const detector = await LanguageDetector.create();
    const compactedResults = [];

    // コードブロックや重要な情報は圧縮から除外するカスタムパーサ
    for (const msg of this.fullHistory) {
      if (msg.content.includes('```')) {
        // 技術的なコード定義を含むものは原型のまま保持
        compactedResults.push({ role: msg.role, content: msg.content });
        continue;
      }

      // 1. ターンごとの言語を自動識別
      const langResults = await detector.detect(msg.content);
      const matchedLang = langResults.length > 0 ? langResults[0].detectedLanguage : 'en';

      // 2. 最速モデル (speed) によるメッセージ単位の要約
      const summarizer = await Summarizer.create({
        type: 'tldr',
        format: 'plain-text',
        length: 'short',
        preference: 'speed', // 軽量・低遅延要約モデルをアサイン [cite: 26]
        expectedInputLanguages: [matchedLang],
        outputLanguage: matchedLang
      });

      const chunkSummary = await summarizer.summarize(msg.content, {
        context: `chat turn context compression: ${msg.role}`
      });

      compactedResults.push({
        role: msg.role,
        content: chunkSummary.length < msg.content.length ? chunkSummary : msg.content
      });

      summarizer.destroy();
    }

    detector.destroy();

    // 3. 圧縮履歴をシードに設定し、新しいセッションをスピンアップ
    this.compactedSeedPrompts = compactedResults;
    await this.initialize();
  }

  async cloneSession() {
    if (!this.session) throw new Error('活性化されたセッションが存在しません。');
    // メインセッションの状態を引き継ぐため、複製してリソースの並行使用に対応
    return await this.session.clone();
  }
}
4. 事例研究と Polyfill を用いたハイブリッド設計パターン4.1. Zero-Knowledge Pitch Builder アーキテクチャの分析クライアントサイド AI を活用した複数 API 連携の先駆的な実例として、zero-knowledge-pitch-builder のアーキテクチャが挙げられる。このアプリケーションは、未公開のビジネスモデルや機密概念を扱うため、一切のサーバー間通信を遮断し、ブラウザ内部でのみ動作するように設計されている。[ 乱雑なブレインストーミングのメモ ]
               │
               ▼
   [ Language Detector API ]  ──► 入力言語の判定
               │
               ▼
[ 独立した 6 つの Prompt API セッション ] （直列パイプライン）
 ├── 1. Hook
 ├── 2. Problem
 ├── 3. Solution
 ├── 4. Value Proposition
 ├── 5. Competitors
 └── 6. Differentiators ──► 各トピックに最適化されたシステムプロンプトで抽出
               │
               ▼
   [ Summarizer / Translator ] ──► ユーザー指定に応じた要約と英日翻訳の実施
               │
               ▼
[ 仮想ペルソナによるレビュー評価 ] ──► 投資家(VC)、エグゼクティブ、消費者の視点でフィードバック
この実装事例が示す重要なファクトは、決定論的に固定された出力を求めず、モデル固有の推論の「ばらつき」や「ゆらぎ」を人間の編集プロセスにおける多様な選択肢として受容している点である。自律エージェントは、このアプローチを参考にし、入力データを並行して異なる性格の複数の Prompt API（ペルソナセッション）に引き渡して、ダイナミックなクロスレビューを自動生成するロジックを構成できる。4.2. Polyfills の活用とタスク API のエミュレーションブラウザ間の互換性を解決し、開発フェーズにおける容易なデバッグ環境を提供するため、Prompt API Polyfill および Task API Polyfill の仕様を以下に検証する。これらポリフィル技術は、以下の構造を通じて内蔵 AI 未対応ブラウザでも協調動作を維持する。ONNX + WebGPU バックエンドによる代替:
ローカルポリフィルは、ブラウザネイティブの LanguageModel インターフェースが存在しない場合、WebGPU または WASM 環境上で onnx-community/gemma-3-1b-it-ONNX-GQA といったオープンソースの軽量モデルを自動ロードする仕組みを持つ。この場合、API キーの配置や読み込み対象モデル名はプロジェクトルートの .env.json ファイルにて管理される。タスク API プロンプトのリバースエンジニアリング:
Task API Polyfill は、Chrome が内部的に実行している Summarizer API や Proofreader API の「隠されたシステムプロンプトおよびプロンプト構造テンプレート」を自律的に展開する。具体的には、ネイティブブラウザが生成する以下のシステムテンプレートを抽出し、汎用の Prompt API を使用して同一のタスクを実行する。Plaintext// Summarizer (key-points) 用の内部システムプロンプト定義
"You are a skilled assistant that accurately summarizes content provided in the TEXT section. The summary must consist of no more than 3 bullet points, but think carefully about the number of bullet points needed. Keep the number of words in the summary shorter than that in the input TEXT."

// Proofreader 用の内部システムプロンプト定義
"You are a skilled proofreader that can identify and correct grammatical errors in a given text in the 'GIVEN_TEXT' section. Your task is to proofread the 'GIVEN_TEXT' and output the 'PROOFREAD_TEXT'. Output ONLY the 'PROOFREAD_TEXT' and nothing else."
自律エージェントは、これらのポリフィル設定ファイルを解析することで、クライアント端末のリソース消費やネットワーク帯域が制限された場合のクラウドAPIへの動的な代替切り替えコードをシームレスに埋め込むことが可能となる。これらの情報をエージェントスキルの知識ベースに統合することにより、環境の不整合を回避し、最高レベルの稼働安定性を誇る次世代の Web システム開発が実現される。
