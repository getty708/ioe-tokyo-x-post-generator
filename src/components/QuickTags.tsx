import React from 'react';

interface QuickTagsProps {
  onSelectTag: (tagText: string) => void;
}

const TAGS = [
  { label: '🔥 神セッション', text: '神セッションすぎる！' },
  { label: '🧠 完全に理解した', text: '完全に理解した。' },
  { label: '💻 明日から試す', text: '明日から早速プロダクトに導入して試す！' },
  { label: '🎯 ここが刺さった', text: '制約の話がリアルで一番刺さった。' },
  { label: '🚀 未来来てる', text: '完全に未来が来てるのを感じる。' }
];

export const QuickTags: React.FC<QuickTagsProps> = ({ onSelectTag }) => {
  return (
    <div className="mb-4 font-body">
      <label className="block text-xs font-mono font-bold text-ink/60 uppercase tracking-wider mb-2">ワンタップで感想を追加 ⚡</label>
      <div className="flex flex-wrap gap-2">
        {TAGS.map(tag => (
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
