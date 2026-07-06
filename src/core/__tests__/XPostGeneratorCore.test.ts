import { expect, test } from 'vitest';
import type { UserInputs } from '../../types';
import { XPostGeneratorCore } from '../XPostGeneratorCore';

test('[Integration] generate post text within 140 X-characters without mock', async () => {
  const isBrowser = typeof window !== 'undefined';
  const hasGlobalAI = isBrowser && 'LanguageModel' in window;
  const hasLegacyAI = isBrowser && 'ai' in window && 'languageModel' in (window as any).ai;

  if (!isBrowser || (!hasGlobalAI && !hasLegacyAI)) {
    console.warn('⚠️ LanguageModel (window.ai) is not available in this environment. Skipping integration test.');
    return;
  }

  const session = {
    id: 'test-session',
    title: 'Chrome Built-in AIの活用方法と実践的なアプローチについてのセッション', // 長めのタイトル
    speaker: 'Google 拡張機能 開発チーム & GDE',
    description: 'ブラウザに組み込まれた Gemini Nano を使用して、サーバーレスで高速な AI 処理を実現する手法を学びます。さらに、WebMCPによる高度なローカルモデル制御についても詳しく解説します。'
  };

  const inputs: UserInputs = {
    personality: 'engineer_passion', // 最も文字数が多くなりやすい人格
    situation: 'session',
    feelingAndNotes: 'ローカルで動くの凄すぎる！超低遅延で感動した！明日から即実戦投入してマージするしかない！🔥🔥💻🚀', // 長めの感想
    includeMeta: true
  };

  // 5パターンのスロットすべてでテストを実行
  for (let index = 0; index < 5; index++) {
    const result = await XPostGeneratorCore.generate(session, inputs, index, 0.6);
    const xLength = XPostGeneratorCore.countXTextLength(result);

    console.log(`[Slot ${index}] Generated Text (Length: ${xLength}):\n${result}\n`);

    // Xの文字数上限である140文字以下であることを検証
    expect(xLength).toBeLessThanOrEqual(140);
  }
}, 45000); // タイムアウトを45秒に設定

test('countXTextLength returns integers even for odd numbers of half-width characters', () => {
  // 半角1文字 (本来は0.5文字) -> 切り上げて1文字
  expect(XPostGeneratorCore.countXTextLength('a')).toBe(1);
  // 半角3文字 (本来は1.5文字) -> 切り上げて2文字
  expect(XPostGeneratorCore.countXTextLength('abc')).toBe(2);
  // 半角2文字 (本来は1.0文字) -> 1文字
  expect(XPostGeneratorCore.countXTextLength('ab')).toBe(1);
  // 全角1文字 + 半角1文字 (本来は1.5文字) -> 切り上げて2文字
  expect(XPostGeneratorCore.countXTextLength('あa')).toBe(2);
  // 絵文字 + 半角1文字 (本来は1.5文字) -> 切り上げて2文字
  expect(XPostGeneratorCore.countXTextLength('✨a')).toBe(2);
});

