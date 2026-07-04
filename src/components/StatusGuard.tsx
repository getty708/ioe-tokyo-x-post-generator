import React from 'react';

export interface ModelState {
  id: 'LanguageModel' | 'Summarizer' | 'LanguageDetector';
  name: string;
  status: 'checking' | 'available' | 'downloadable' | 'downloading' | 'unsupported';
  loaded: number;
  total: number;
}

interface StatusGuardProps {
  models: ModelState[];
  onStartDownload: (id: 'LanguageModel' | 'Summarizer' | 'LanguageDetector') => void;
  children: React.ReactNode;
}

export const StatusGuard: React.FC<StatusGuardProps> = ({ models, onStartDownload, children }) => {
  const getStatusBadge = (status: ModelState['status']) => {
    switch (status) {
      case 'available':
        return <span className="px-2.5 py-1 text-xs font-mono font-bold bg-pastel-green border border-google-green text-google-green rounded-full">利用可能 (Ready)</span>;
      case 'downloadable':
        return <span className="px-2.5 py-1 text-xs font-mono font-bold bg-pastel-yellow border border-google-yellow text-[#b28200] rounded-full">要ダウンロード</span>;
      case 'downloading':
        return <span className="px-2.5 py-1 text-xs font-mono font-bold bg-pastel-blue border border-google-blue text-google-blue rounded-full">ダウンロード中...</span>;
      case 'unsupported':
        return <span className="px-2.5 py-1 text-xs font-mono font-bold bg-pastel-red border border-google-red text-google-red rounded-full">非対応</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-mono font-bold bg-gray-100 border border-gray-400 text-gray-500 rounded-full">確認中...</span>;
    }
  };

  const languageModelReady = models.find(m => m.id === 'LanguageModel')?.status === 'available';

  if (!languageModelReady) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white border-thick rounded-xl shadow-neo font-body">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-google-blue text-white flex items-center justify-center font-mono font-bold border-thick shadow-[2px_2px_0px_0px_#1E1E1E] rounded-full mx-auto mb-4 text-xl">🤖</div>
          <h2 className="text-2xl font-display font-bold text-ink">AIモデルのダウンロード管理</h2>
          <p className="text-sm text-ink/70 mt-2 max-w-sm mx-auto">
            Xポスト生成には <strong>Prompt (LanguageModel)</strong> の準備が必要です。以下からモデルを個別にダウンロードしてください。
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {models.map(model => {
            return (
              <div key={model.id} className="p-4 border-2 border-ink rounded-lg bg-[#f7f9fc]">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div>
                    <h3 className="font-display font-bold text-ink text-sm sm:text-base">{model.name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      {getStatusBadge(model.status)}
                    </div>
                  </div>

                  {model.status === 'downloadable' && (
                    <button
                      onClick={() => onStartDownload(model.id)}
                      className="px-4 py-2 text-xs font-display font-bold bg-white text-ink border-2 border-ink rounded-lg shadow-[2px_2px_0px_0px_#1E1E1E] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#1E1E1E] active:translate-x-0 active:translate-y-0 cursor-pointer transition-all duration-150 shrink-0"
                    >
                      モデルをダウンロード ↓
                    </button>
                  )}
                </div>

                {model.status === 'downloading' && (
                  <div className="mt-3 flex items-center gap-2 text-xs font-mono text-ink/70">
                    <div className="animate-spin w-4 h-4 border-2 border-google-blue border-t-transparent rounded-full"></div>
                    <span>バックグラウンドでダウンロード進行中...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-pastel-blue border border-ink/20 rounded-md text-xs leading-relaxed text-ink/80 flex items-start gap-2">
          <span className="text-google-blue font-bold">ℹ️</span>
          <span>
            モデルダウンロードはブラウザのバックグラウンドで行われます。ダウンロードが始まらない場合は、Chrome で <code>chrome://on-device-internals</code> を開き、ダウンロード状況を確認してください。
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
