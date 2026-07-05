import React from 'react';

interface QuickTagsProps {
  situation: 'pre_event' | 'attendance' | 'session' | 'review';
  onSelectTag: (tagText: string) => void;
}

const TAGS_MAP = {
  pre_event: [
    { label: '🎟️ 渋谷枠確保！', text: '渋谷会場の現地参加枠を確保！' },
    { label: '🤖 WebMCP気になる', text: 'WebMCPのセッションがめちゃくちゃ気になる。' },
    { label: '🚀 刺激をもらう', text: '最先端のWeb技術に触れて刺激をもらうぞ！' },
    { label: '📈 キャッチアップ', text: 'Google I/O 2026の最新アップデートをキャッチアップする！' }
  ],
  attendance: [
    { label: '📍 渋谷到着！', text: 'Google渋谷オフィスに到着！会場の熱気がすごい。' },
    { label: '🧥 冷房対策ヨシ！', text: '会場内の冷房対策で上着は必須だな。' },
    { label: '🎁 スワッグ最高', text: '限定スワッグがデザイン良すぎてテンション上がる！' },
    { label: '🥐 朝食チャージ', text: '朝食もしっかり食べて現地参戦！' }
  ],
  session: [
    { label: '🔥 神セッション', text: '神セッションすぎる！' },
    { label: '🧠 完全に理解した', text: '完全に理解した。' },
    { label: '🤔 何もわからない', text: '何もわからない（深淵をのぞき込んだ気持ち）。' },
    { label: '🚀 明日から即マージ', text: '明日から即プロダクションにマージしたい！' },
    { label: '💬 Ask Speaker行く', text: 'セッション後、速攻でスピーカーブースに質問に行く！' }
  ],
  review: [
    { label: '📝 Zenn書くぞ', text: '今日の学びをZennにまとめてアウトプットする！' },
    { label: '💻 即コードに落とす', text: '学んだことを忘れないうちにローカルでコードに落とし込む！' },
    { label: '🚀 最高のイベント', text: '最高のイベントだった。運営の皆様ありがとうございました！' },
    { label: '📈 モチベ爆上がり', text: '開発モチベーションが爆上がりした一日だった。' }
  ]
};

export const QuickTags: React.FC<QuickTagsProps> = ({ situation, onSelectTag }) => {
  const currentTags = TAGS_MAP[situation] || [];

  return (
    <div className="mb-4 font-body">
      <label className="block text-xs font-mono font-bold text-ink/60 uppercase tracking-wider mb-2">ワンタップで感想を追加 ⚡</label>
      <div className="flex flex-wrap gap-2">
        {currentTags.map(tag => (
          <button
            key={tag.label}
            type="button"
            onClick={() => onSelectTag(tag.text)}
            className="px-3 py-1.5 text-xs font-mono border-thick bg-white text-ink rounded-full shadow-[2px_2px_0px_0px_#1E1E1E] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#1E1E1E] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_0px_#1E1E1E] transition-all duration-150 cursor-pointer"
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
};
