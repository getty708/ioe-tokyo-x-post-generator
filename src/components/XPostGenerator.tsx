import React, { useState, useEffect } from 'react';
import { XPostGeneratorCore } from '../core/XPostGeneratorCore';
import type { SessionInfo, UserInputs } from '../types';
import { StatusGuard, type ModelState } from './StatusGuard';
import { QuickTags } from './QuickTags';

export const XPostGenerator: React.FC = () => {
  const [models, setModels] = useState<ModelState[]>([
    { id: 'LanguageModel', name: 'Prompt API (LanguageModel)', status: 'checking', loaded: 0, total: 0 },
    { id: 'Summarizer', name: 'Summarizer API', status: 'checking', loaded: 0, total: 0 },
    { id: 'LanguageDetector', name: 'Language Detector API', status: 'checking', loaded: 0, total: 0 },
  ]);
  
  const [session, setSession] = useState<SessionInfo>({
    id: 'custom',
    title: 'Chrome Built-in AIでつくる次世代Webアプリ of UX設計と実践',
    speaker: 'GDG Tokyo Dev',
    description: 'Gemini NanoをWebブラウザ上で動作させ、サーバーコストをゼロにしながら極上のプライバシーUXを提供する手法を解説します。'
  });

  const [inputs, setInputs] = useState<UserInputs>({
    situation: 'session',
    feelingAndNotes: '',
    personality: 'engineer_logical',
    includeMeta: true
  });

  const [candidates, setCandidates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [compressingIndex, setCompressingIndex] = useState<number | null>(null);
  const [editModes, setEditModes] = useState<boolean[]>([false, false, false]);
  const [draftCount, setDraftCount] = useState<number>(3);
  const [temperature, setTemperature] = useState<number>(0.8);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Initialize AI check
  useEffect(() => {
    const checkAll = async () => {
      const results = await Promise.all(
        models.map(async (m) => {
          const check = await XPostGeneratorCore.checkApiAvailability(m.id);
          let status: ModelState['status'] = 'unsupported';
          if (check.status === 'readily') status = 'available';
          else if (check.status === 'downloadable') status = 'downloadable';
          else if (check.status === 'downloading') status = 'downloading';
          return { ...m, status };
        })
      );
      setModels(results);
    };
    checkAll();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setCandidates([]);
    setEditModes(Array(draftCount).fill(false));
    try {
      const currentCandidates: string[] = [];
      for (let i = 0; i < draftCount; i++) {
        const result = await XPostGeneratorCore.generate(session, inputs, i, temperature);
        currentCandidates.push(result);
        setCandidates([...currentCandidates]);
      }
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCandidate = (index: number, newText: string) => {
    setCandidates(prev => {
      const updated = [...prev];
      updated[index] = newText;
      return updated;
    });
  };

  const handleStartDownload = async (id: 'LanguageModel' | 'Summarizer' | 'LanguageDetector') => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, status: 'downloading', loaded: 0, total: 0 } : m));
    try {
      const session = await XPostGeneratorCore.startDownloadApi(id, (loaded, total) => {
        setModels(prev => prev.map(m => m.id === id ? { ...m, loaded, total } : m));
      });
      if (session && typeof session.destroy === 'function') {
        session.destroy();
      }
      const check = await XPostGeneratorCore.checkApiAvailability(id);
      let status: ModelState['status'] = 'unsupported';
      if (check.status === 'readily') status = 'available';
      else if (check.status === 'downloadable') status = 'downloadable';
      else if (check.status === 'downloading') status = 'downloading';
      
      setModels(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    } catch (err) {
      alert(`ダウンロードエラー: ${(err as Error).message}`);
      const check = await XPostGeneratorCore.checkApiAvailability(id);
      let status: ModelState['status'] = 'unsupported';
      if (check.status === 'readily') status = 'available';
      else if (check.status === 'downloadable') status = 'downloadable';
      else if (check.status === 'downloading') status = 'downloading';
      
      setModels(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    }
  };

  const handleCompress = async (index: number, text: string) => {
    setCompressingIndex(index);
    try {
      const compressed = await XPostGeneratorCore.compress(text, session.title);
      handleEditCandidate(index, compressed);
    } catch (err) {
      alert(`要約失敗: ${(err as Error).message}`);
    } finally {
      setCompressingIndex(null);
    }
  };

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSituationChange = (sit: UserInputs['situation']) => {
    let nextPersonality = inputs.personality;
    if (sit === 'pre_event' || sit === 'attendance') {
      nextPersonality = 'engineer_passion';
    } else if (sit === 'session' || sit === 'review') {
      nextPersonality = 'engineer_logical';
    }
    setInputs({
      ...inputs,
      situation: sit,
      personality: nextPersonality
    });
  };

  const copyThreadUrl = async () => {
    const threadText = `このポストはChrome内蔵AIで投稿原稿を作る「X Post Generator」を使用しました！\n詳細はこちら: https://ioe-tokyo-2026.web.app/`;
    try {
      await navigator.clipboard.writeText(threadText);
      triggerToast("スレッド用URLをクリップボードにコピーしました！投稿のリプライ欄に貼ってね 🔗");
    } catch (err) {
      console.error(err);
      alert("コピーに失敗しました。ブラウザのアクセス許可を確認してください。");
    }
  };

  const handlePostClick = async () => {
    const threadText = `このポストはChrome内蔵AIで投稿原稿を作る「X Post Generator」を使用しました！\n詳細はこちら: https://ioe-tokyo-2026.web.app/`;
    try {
      await navigator.clipboard.writeText(threadText);
      triggerToast("投稿画面を開きました！リプライ用に紹介URLもコピーしました 🔗");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 my-4 font-body bg-transparent">
      <StatusGuard models={models} onStartDownload={handleStartDownload}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: User Input Panel (6 cols on lg) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Session Info Input Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-[8px] h-[28px] bg-google-blue rounded-sm"></div>
                <h2 className="text-lg md:text-xl font-display font-bold text-ink">聴講中のセッション情報</h2>
              </div>
              
              <div className="p-6 bg-white border-thick rounded-xl shadow-neo space-y-4">
                <div className="space-y-3">
                  <div>
                    <label htmlFor="session-title" className="block text-xs font-mono font-bold text-ink/70 mb-1 uppercase">セッション名</label>
                    <input
                      id="session-title"
                      type="text"
                      value={session.title}
                      onChange={e => setSession({ ...session, title: e.target.value })}
                      placeholder="セッションのタイトルを入力..."
                      className="w-full p-3 text-sm border-2 border-ink rounded-lg outline-none focus:bg-pastel-blue/20 transition font-body"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="session-speaker" className="block text-xs font-mono font-bold text-ink/70 mb-1 uppercase">登壇者 (スピーカー)</label>
                    <input
                      id="session-speaker"
                      type="text"
                      value={session.speaker}
                      onChange={e => setSession({ ...session, speaker: e.target.value })}
                      placeholder="スピーカー名を入力..."
                      className="w-full p-3 text-sm border-2 border-ink rounded-lg outline-none focus:bg-pastel-blue/20 transition font-body"
                    />
                  </div>

                  <div>
                    <label htmlFor="session-desc" className="block text-xs font-mono font-bold text-ink/70 mb-1 uppercase">セッション概要</label>
                    <textarea
                      id="session-desc"
                      value={session.description}
                      onChange={e => setSession({ ...session, description: e.target.value })}
                      placeholder="セッションの概要やポイントを入力..."
                      className="w-full p-3 text-sm border-2 border-ink rounded-lg outline-none focus:bg-pastel-blue/20 transition h-20 resize-none font-body"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Input Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-[8px] h-[28px] bg-google-yellow rounded-sm"></div>
                <h2 className="text-lg md:text-xl font-display font-bold text-ink">AI へのインプット</h2>
              </div>

              <div className="p-6 bg-white border-thick rounded-xl shadow-neo space-y-6">
                {/* Situation */}
                <div>
                  <label className="block text-sm font-display font-bold text-ink mb-2">今のタイミングは？ ⚡</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'pre_event', label: '🎟️ 参加表明' },
                      { id: 'attendance', label: '📍 会場到着' },
                      { id: 'session', label: '💡 実況' },
                      { id: 'review', label: '📝 振り返り' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSituationChange(item.id as any)}
                        className={`py-2 px-0.5 text-[11px] md:text-xs font-display font-bold rounded-lg border-2 cursor-pointer transition-all duration-150 ${
                          inputs.situation === item.id 
                            ? 'bg-google-blue text-white border-ink shadow-[2px_2px_0px_0px_#1E1E1E]' 
                            : 'bg-white text-ink border-ink hover:bg-pastel-blue shadow-[2px_2px_0px_0px_#1E1E1E] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#1E1E1E] active:translate-x-0 active:translate-y-0'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea & Tags */}
                <div>
                  <label className="block text-sm font-display font-bold text-ink mb-2">感想メモ（自由入力） ✍️</label>
                  <textarea
                    value={inputs.feelingAndNotes}
                    onChange={e => setInputs({ ...inputs, feelingAndNotes: e.target.value })}
                    placeholder="例: Web Worker制限の話が刺さった！並列処理気をつけよう..."
                    className="w-full p-3 text-sm border-2 border-ink rounded-lg focus:bg-pastel-blue/20 outline-none h-24 resize-none transition shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)]"
                  />
                  <div className="mt-2">
                    <QuickTags 
                      situation={inputs.situation} 
                      onSelectTag={(text) => setInputs({ ...inputs, feelingAndNotes: inputs.feelingAndNotes + text })} 
                    />
                  </div>
                </div>

                {/* Personality */}
                <div>
                  <label className="block text-sm font-display font-bold text-ink mb-2">ポストの「人格」を選ぶ 🎭</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'engineer_logical', label: '💻 ｴﾝｼﾞﾆｱ(要約)', color: 'hover:bg-pastel-blue' },
                      { id: 'engineer_passion', label: '💡 ｴﾝｼﾞﾆｱ(熱量)', color: 'hover:bg-pastel-blue' },
                      { id: 'gal', label: '🌺 ギャル', color: 'hover:bg-pastel-red' },
                      { id: 'hotblooded', label: '🔥 熱血', color: 'hover:bg-pastel-yellow' },
                      { id: 'kansai', label: '🐙 関西弁', color: 'hover:bg-pastel-green' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setInputs({ ...inputs, personality: item.id as any })}
                        className={`py-2 px-0.5 text-[10px] md:text-xs font-display font-bold rounded-lg border-2 cursor-pointer transition-all duration-150 ${
                          inputs.personality === item.id 
                            ? 'bg-ink text-white border-ink shadow-[2px_2px_0px_0px_#1E1E1E]' 
                            : `bg-white text-ink border-ink shadow-[2px_2px_0px_0px_#1E1E1E] ${item.color} hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#1E1E1E] active:translate-x-0 active:translate-y-0`
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Include Meta Tag */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="include-meta"
                    type="checkbox"
                    checked={inputs.includeMeta}
                    onChange={e => setInputs({ ...inputs, includeMeta: e.target.checked })}
                    className="w-4 h-4 text-google-blue border-2 border-ink rounded focus:ring-google-blue cursor-pointer"
                  />
                  <label htmlFor="include-meta" className="text-xs md:text-sm font-display font-bold text-ink cursor-pointer select-none">
                    末尾に WebAI メタ情報ハッシュタグ（#GeminiNano）を含める
                  </label>
                </div>

                {/* Generation Options */}
                <div className="border-t border-ink/10 pt-4 space-y-4 font-body">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Draft Count Selector */}
                    <div className="flex-1">
                      <label className="block text-xs font-mono font-bold text-ink/70 mb-1 uppercase">生成件数: {draftCount}件</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setDraftCount(n)}
                            className={`w-9 h-9 font-mono font-bold rounded-lg border-2 cursor-pointer transition-all duration-150 flex items-center justify-center text-xs ${
                              draftCount === n
                                ? 'bg-ink text-white border-ink shadow-[1px_1px_0px_0px_#1E1E1E]'
                                : 'bg-white text-ink border-ink hover:bg-pastel-blue shadow-[1px_1px_0px_0px_#1E1E1E] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0 active:translate-y-0'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Temperature Slider */}
                    <div className="flex-1">
                      <label htmlFor="temp-slider" className="block text-xs font-mono font-bold text-ink/70 mb-1 uppercase">ランダム性 (Temp): {temperature.toFixed(1)}</label>
                      <input
                        id="temp-slider"
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={temperature}
                        onChange={e => setTemperature(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-google-blue border border-ink/20"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-ink/40 mt-1">
                        <span>堅実 (0.1)</span>
                        <span>創造的 (2.0)</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Trigger */}
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-4 bg-google-green text-white font-display font-bold text-base border-thick rounded-xl shadow-neo hover:-translate-x-1 hover:-translate-y-1 hover:shadow-neo-hover active:translate-x-0 active:translate-y-0 active:shadow-neo disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                >
                  {loading ? '候補を順番に生成中... 🤖' : `Xポスト候補を${draftCount}件順番に生成 ✨`}
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Column: X Post Simulator Panel (6 cols on lg) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-[8px] h-[28px] bg-google-red rounded-sm"></div>
              <h2 className="text-lg md:text-xl font-display font-bold text-ink">Xポスト候補（シミュレータ）</h2>
            </div>

            <div className="space-y-4">
              {Array.from({ length: draftCount }).map((_, idx) => {
                const isGenerated = idx < candidates.length;
                const isGenerating = idx === candidates.length && loading;
                
                if (isGenerated) {
                  const text = candidates[idx];
                  const charCount = text.length;
                  const isOver = charCount > 140;

                  return (
                    <div 
                      key={idx} 
                      className="bg-white border-2 border-ink rounded-2xl p-5 shadow-neo hover:shadow-neo-hover transition duration-150 relative"
                    >
                      {/* X Post Profile Header */}
                      <div className="flex items-center gap-3 mb-3.5">
                        {/* Custom SVG Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-google-blue via-google-red to-google-yellow p-0.5 flex items-center justify-center border border-ink/10 shrink-0">
                          <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-ink font-mono text-sm">
                            #{idx + 1}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-sans font-bold text-sm text-ink leading-tight">I/O Extended Participant</span>
                          <span className="font-sans text-xs text-ink/50 leading-none">@ioe_tokyo_2026</span>
                        </div>
                      </div>

                      {/* X Post Content */}
                      <div className="pl-13">
                        {editModes[idx] ? (
                          <textarea
                            value={text}
                            onChange={(e) => handleEditCandidate(idx, e.target.value)}
                            className="w-full bg-white border-2 border-ink rounded-lg p-2.5 text-sm font-sans leading-relaxed resize-y focus:outline-none focus:bg-pastel-blue/5 focus:ring-1 focus:ring-google-blue transition"
                            style={{ minHeight: '120px' }}
                            rows={4}
                          />
                        ) : (
                          <div className="text-sm font-sans text-ink leading-relaxed whitespace-pre-wrap select-text break-all pb-1 min-h-[80px]">
                            {text}
                          </div>
                        )}

                        {/* Character Counter & Warnings */}
                        <div className="flex items-center justify-between border-t border-ink/5 pt-2.5 mt-2.5">
                          <span className={`font-mono text-xs font-bold ${isOver ? 'text-google-red' : 'text-ink/40'}`}>
                            {charCount} / 140 {isOver && '⚠️ 文字数超過'}
                          </span>
                          
                          {/* Simulated X Action Icons (subtle inline SVGs) */}
                          <div className="flex items-center gap-4 text-ink/30">
                            {/* Reply */}
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {/* Repost */}
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.248 8H18" />
                            </svg>
                            {/* Like */}
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                        </div>

                        {/* Action buttons (Compress, Edit Toggle, Post) */}
                        <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-3 border-t border-ink/10">
                          {isOver && (
                            <button
                              onClick={() => handleCompress(idx, text)}
                              disabled={compressingIndex === idx}
                              className="px-3 py-1.5 text-xs font-display font-bold bg-[#E8F0FE] text-google-blue border border-google-blue rounded-lg shadow-[1px_1px_0px_0px_#1a73e8] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1a73e8] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
                            >
                              {compressingIndex === idx ? (
                                <>
                                  <div className="animate-spin w-3 h-3 border-2 border-google-blue border-t-transparent rounded-full"></div>
                                  <span>圧縮中...</span>
                                </>
                              ) : (
                                <span>圧縮 ⚡</span>
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => setEditModes(prev => prev.map((v, k) => k === idx ? !v : v))}
                            className={`px-3 py-1.5 text-xs font-display font-bold border border-ink rounded-lg transition shadow-[1px_1px_0px_0px_#1E1E1E] cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1E1E] active:translate-x-0 active:translate-y-0 shrink-0 ${
                              editModes[idx] 
                                ? 'bg-ink text-white border-ink' 
                                : 'bg-white hover:bg-pastel-blue text-ink border-ink'
                            }`}
                          >
                             {editModes[idx] ? '決定 💾' : '編集 ✏️'}
                          </button>

                          <button
                            onClick={copyThreadUrl}
                            className="px-3 py-1.5 text-xs font-display font-bold bg-white text-google-yellow border border-google-yellow rounded-lg transition shadow-[1px_1px_0px_0px_#fbbc05] cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#fbbc05] active:translate-x-0 active:translate-y-0 shrink-0 flex items-center gap-1"
                          >
                            <span>スレッドURL 📋</span>
                          </button>

                          <a
                            href={XPostGeneratorCore.getXShareUrl(text)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-4 py-1.5 text-xs font-display font-bold rounded-full transition-all flex items-center justify-center gap-1 shrink-0 ${
                              isOver 
                                ? 'bg-gray-100 text-gray-400 border border-gray-200 pointer-events-none' 
                                : 'bg-[#1D9BF0] hover:bg-[#1A8CD8] text-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#1E1E1E] active:translate-x-0 active:translate-y-0'
                            }`}
                            onClick={(e) => {
                              if (isOver) {
                                e.preventDefault();
                              } else {
                                handlePostClick();
                              }
                            }}
                          >
                            ポストする 🐦
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (isGenerating) {
                  return (
                    <div 
                      key={idx} 
                      className="bg-[#fcfdfd] border-2 border-dashed border-ink/40 rounded-2xl p-5 relative overflow-hidden"
                    >
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-dashed border-ink/20">
                          <div className="animate-spin w-4 h-4 border-2 border-google-blue border-t-transparent rounded-full"></div>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-sans font-bold text-sm text-ink/60">Candidate #{idx + 1}</span>
                          <span className="font-mono text-[10px] text-google-blue font-bold uppercase animate-pulse">Drafting post...</span>
                        </div>
                      </div>
                      
                      {/* Pulsing Loading Lines */}
                      <div className="pl-13 space-y-2 mt-1 animate-pulse">
                        <div className="h-3.5 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3.5 bg-gray-200 rounded w-4/6"></div>
                        <div className="h-3.5 bg-gray-200 rounded w-2/6"></div>
                      </div>
                    </div>
                  );
                }

                // Placeholder slot (Waiting/Pending)
                return (
                  <div 
                    key={idx} 
                    className="bg-transparent border-2 border-dashed border-ink/20 rounded-2xl p-5 text-center text-ink/30 font-display font-bold text-sm flex items-center justify-center gap-2 h-32"
                  >
                    <span>候補 #{idx + 1} (待機中...)</span>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </StatusGuard>

      {/* Copy notification Toast */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-ink text-white border-2 border-white px-4 py-3 rounded-lg shadow-neo-hover font-bold text-xs flex items-center gap-2 animate-bounce">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default XPostGenerator;
