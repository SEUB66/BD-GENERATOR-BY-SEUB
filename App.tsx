
import React, { useState, useEffect, useRef } from 'react';
import { INITIAL_COMIC_DATA } from './constants';
import { ComicProject, ViewMode, Panel, Character, Branding } from './types';
import { geminiService } from './services/geminiService';
import { audioService } from './services/audioService';

const BRANDING_KEY = 'MBDM_STATION_BRANDING_V16';
const STORAGE_KEY = 'MBDM_WORKSPACE_V16';
const LIBRARY_KEY = 'MBDM_GLOBAL_LIBRARY_V16';

export default function App() {
  const [branding, setBranding] = useState<Branding>(() => {
    try {
      const saved = localStorage.getItem(BRANDING_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [comic, setComic] = useState<ComicProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_COMIC_DATA;
    } catch { return INITIAL_COMIC_DATA; }
  });

  const [publishedComics, setPublishedComics] = useState<ComicProject[]>(() => {
    try {
      const saved = localStorage.getItem(LIBRARY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [viewMode, setViewMode] = useState<ViewMode>('studio');
  const [fullscreen, setFullscreen] = useState<string | null>(null);
  const [refineId, setRefineId] = useState<string | null>(null);
  const [refinePrompt, setRefinePrompt] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const vanInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (Object.keys(branding).length > 0) {
      localStorage.setItem(BRANDING_KEY, JSON.stringify(branding));
    }
  }, [branding]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comic));
  }, [comic]);

  useEffect(() => {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(publishedComics));
  }, [publishedComics]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: keyof Branding) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2.5 * 1024 * 1024) {
        alert("IMAGE TROP LOURDE ! (MAX 2.5MB)");
        return;
      }
      const reader = new FileReader();
      reader.onload = (re) => {
        const result = re.target?.result as string;
        setBranding(prev => ({ ...prev, [type]: result }));
        audioService.playDoneGen();
        if (e.target) e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const updatePanel = (id: string, updates: Partial<Panel>) => {
    setComic(prev => ({
      ...prev,
      pages: prev.pages.map(page => ({
        ...page,
        panels: page.panels.map(p => p.id === id ? { ...p, ...updates } : p)
      }))
    }));
  };

  const handleAction = async (id: string, mode: 'new' | 'edit') => {
    const panel = comic.pages.flatMap(p => p.panels).find(p => p.id === id);
    if (!panel) return;
    audioService.playStartGen();
    setLoadingId(id);
    updatePanel(id, { status: 'generating' });
    try {
      const refs = [];
      if (mode === 'edit' && panel.imageUrl) refs.push({ data: panel.imageUrl, mimeType: 'image/png' });
      const prompt = mode === 'edit' ? refinePrompt : panel.description;
      const url = await geminiService.generatePanelImage(
        prompt, 
        comic.style, 
        comic.globalContext, 
        comic.characters, 
        refs, 
        mode === 'edit'
      );
      updatePanel(id, { imageUrl: url, status: 'completed' });
      audioService.playDoneGen();
      setRefineId(null);
      setRefinePrompt("");
    } catch (e: any) {
      alert(e.message);
      updatePanel(id, { status: 'error' });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative z-20">
      <input type="file" ref={vanInputRef} className="hidden" accept="image/*" onChange={(e) => onFileChange(e, 'van')} />
      <input type="file" ref={titleInputRef} className="hidden" accept="image/*" onChange={(e) => onFileChange(e, 'title')} />
      <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => onFileChange(e, 'banner')} />

      {/* HEADER MEGA - LOCK LOGOS */}
      <header className="flex items-center gap-16 px-16 py-12 bg-black/20 border-b border-white/5 backdrop-blur-xl shrink-0">
        <div 
          className="relative group cursor-pointer hover:scale-105 transition-all duration-500 shrink-0" 
          onClick={() => vanInputRef.current?.click()}
        >
          {branding.van ? (
            <img src={branding.van} className="h-[220px] w-auto object-contain filter drop-shadow(0 0 40px rgba(162,209,73,0.3))" />
          ) : (
            <div className="h-[200px] w-[280px] border-4 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center font-pixel text-white/20 bg-white/5 uppercase">
              UPLOAD_VAN
            </div>
          )}
        </div>
        
        <div 
          className="relative group cursor-pointer hover:scale-[1.01] transition-all duration-500 shrink-0" 
          onClick={() => titleInputRef.current?.click()}
        >
          {branding.title ? (
            <img src={branding.title} className="h-[160px] w-auto object-contain filter drop-shadow(0 0 50px rgba(255,0,127,0.2))" />
          ) : (
            <div className="h-[140px] w-[550px] border-4 border-dashed border-white/10 rounded-3xl flex items-center justify-center font-pixel text-white/20 bg-white/5 uppercase">
              UPLOAD_STATION_TITLE
            </div>
          )}
        </div>

        <div className="ml-auto flex flex-col items-end gap-3">
          <div className="bg-zinc-950/80 p-8 rounded-[2rem] border border-white/10 flex flex-col items-end shadow-2xl backdrop-blur-3xl">
            <span className="font-pixel text-[10px] text-[#FF007F] tracking-[0.6em] mb-2 font-black uppercase">OPERATOR_ID</span>
            <input 
              value={comic.author} 
              onChange={e => setComic({...comic, author: e.target.value.toUpperCase()})}
              className="bg-transparent text-right font-pixel text-3xl text-[#A2D149] focus:outline-none w-full border-none outline-none"
            />
          </div>
          <div className="flex items-center gap-2 px-4">
            <div className="h-3 w-3 rounded-full bg-lime-500 animate-pulse shadow-[0_0_15px_#A2D149]"></div>
            <span className="font-pixel text-[8px] text-white/30 uppercase tracking-[0.4em] font-bold">DNA_LINK_STABLE</span>
          </div>
        </div>
      </header>

      {/* NAV BAR */}
      <nav className="flex items-center gap-6 px-16 py-10 shrink-0">
        <div className="flex bg-zinc-900/80 backdrop-blur-3xl px-8 py-4 rounded-3xl border border-white/5 gap-6 shadow-2xl">
          {['studio', 'assets', 'library', 'author'].map((t) => (
            <button 
              key={t}
              onClick={() => { audioService.playNav(); setViewMode(t as ViewMode); }}
              className={`font-pixel text-[12px] tracking-[0.2em] px-8 py-4 rounded-2xl transition-all font-black uppercase glitch-hover ${viewMode === t ? 'bg-[#A2D149] text-black shadow-[6px_6px_0_#000]' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
            >
              {t === 'author' ? 'MY_DOCK' : t.toUpperCase()}
            </button>
          ))}
        </div>
        <button 
          onClick={() => { audioService.playNav(); setViewMode('reader'); }}
          className="ml-auto px-16 py-6 bg-white text-black font-pixel text-xs rounded-2xl shadow-[10px_10px_0_#000] hover:bg-[#FF007F] hover:text-white transition-all uppercase font-black italic tracking-[0.2em]"
        >
          RENDER_STORY_DNA
        </button>
      </nav>

      {/* MAIN ENGINE */}
      <main className="flex-grow p-16 max-w-[1750px] mx-auto w-full">
        {viewMode === 'studio' && (
          <div className="space-y-24 animate-in fade-in duration-1000">
            <div className="bg-zinc-950/40 p-16 rounded-[4rem] border-4 border-white/5 flex items-center justify-between backdrop-blur-2xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col gap-4">
                <h2 className="font-pixel text-7xl text-white tracking-tighter italic font-black uppercase">STATION_ENGINE_v16</h2>
                <div className="flex items-center gap-4">
                  <div className="h-5 w-5 rounded-full bg-[#A2D149] animate-pulse"></div>
                  <p className="text-[#A2D149] font-pixel text-sm uppercase tracking-[0.6em] font-black">CORE_READY_FOR_INJECTION</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const freshPublish = {...comic, id: "pub-"+Date.now(), publishedAt: new Date().toISOString()};
                  setPublishedComics(p => [freshPublish, ...p]);
                  alert("STATION: BD PUBLIÉE !");
                  setViewMode('library');
                }} 
                className="px-16 py-8 bg-[#A2D149] text-black font-pixel text-2xl rounded-3xl shadow-[12px_12px_0_#000] hover:scale-105 active:translate-x-2 active:translate-y-2 active:shadow-[4px_4px_0_#000] transition-all uppercase italic font-black"
              >
                PUBLIER_OEUVRE
              </button>
            </div>

            {comic.pages.map((page, pIdx) => (
              <section key={pIdx} className="space-y-16">
                <div className="flex items-center gap-10 bg-white/5 p-10 rounded-3xl border border-white/5 backdrop-blur-md">
                  <span className="font-pixel text-sm text-[#FF007F] font-black tracking-widest px-8 py-4 bg-black rounded-2xl border border-[#FF007F]/20">SEQ_0{pIdx+1}</span>
                  <input value={page.title} onChange={e => {
                    const pages = [...comic.pages]; pages[pIdx].title = e.target.value; setComic({...comic, pages});
                  }} className="bg-transparent border-none text-6xl font-pixel text-white focus:outline-none w-full uppercase italic tracking-tighter font-black" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-20">
                  {page.panels.map(panel => (
                    <div key={panel.id} className="group relative flex flex-col bg-zinc-950/50 border-[10px] border-black rounded-[4rem] overflow-hidden shadow-[0_80px_150px_rgba(0,0,0,0.9)] transition-all hover:border-[#A2D149]/40 hover:-translate-y-3 backdrop-blur-sm">
                      <div className="aspect-square relative bg-zinc-950">
                        {panel.imageUrl ? (
                          <>
                            <img src={panel.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-12 backdrop-blur-3xl">
                               <button onClick={() => setFullscreen(panel.imageUrl!)} className="px-16 py-6 bg-white text-black font-pixel text-sm rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all uppercase font-black italic">ZOOM_DNA</button>
                               <button onClick={() => setRefineId(panel.id)} className="px-16 py-6 bg-yellow-400 text-black font-pixel text-sm rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all uppercase font-black italic">PATCH_FRAME</button>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-5">
                            <span className="text-[20rem] font-pixel">+</span>
                          </div>
                        )}
                        {loadingId === panel.id && (
                          <div className="absolute inset-0 bg-black/98 flex flex-col items-center justify-center z-50">
                             <div className="w-36 h-36 border-[15px] border-white/5 border-t-[#A2D149] animate-spin rounded-full mb-12 shadow-[0_0_150px_rgba(162,209,73,0.6)]"></div>
                             <span className="font-pixel text-base animate-pulse text-[#A2D149] tracking-[2em] font-black uppercase">DNA_SYNCING</span>
                          </div>
                        )}
                      </div>
                      <div className="p-12 space-y-12">
                        <textarea 
                          placeholder="Décrivez l'action prestige..."
                          value={panel.description}
                          onChange={e => updatePanel(panel.id, { description: e.target.value })}
                          className="w-full bg-black border-4 border-white/5 p-10 text-xl leading-relaxed focus:border-[#A2D149]/50 outline-none min-h-[200px] resize-none text-white/90 rounded-[3rem] transition-all shadow-inner font-bold italic"
                        />
                        <button onClick={() => handleAction(panel.id, 'new')} disabled={!!loadingId} className="w-full py-12 text-6xl font-pixel bg-[#FF007F] text-white hover:brightness-110 active:scale-95 transition-all uppercase italic font-black rounded-[3.5rem] shadow-[15px_15px_0_#000] border-b-8 border-black">
                          GENERATE
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => {
                    const pages = [...comic.pages]; pages[pIdx].panels.push({ id: `p-${Date.now()}`, description: "", status: 'idle' }); setComic({...comic, pages});
                  }} className="aspect-square border-6 border-dashed border-white/10 rounded-[6rem] flex flex-col items-center justify-center hover:bg-white/5 hover:border-[#A2D149]/50 transition-all group backdrop-blur-md">
                    <span className="text-[16rem] opacity-5 group-hover:opacity-40 font-pixel transition-all">+</span>
                    <span className="font-pixel text-base mt-12 opacity-5 group-hover:opacity-40 uppercase tracking-[0.8em] font-black">APPEND_DATA_FRAME</span>
                  </button>
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER - BANNER LOCK */}
      <footer className="p-40 border-t-[15px] border-black flex flex-col items-center gap-32 bg-black relative z-[100]">
        <div 
          className="w-full max-w-[1550px] relative group overflow-hidden rounded-[8rem] border-[15px] border-black hover:border-[#A2D149]/40 transition-all duration-700 cursor-pointer shadow-[0_0_200px_rgba(0,0,0,1)] bg-zinc-950/60" 
          style={{ minHeight: '550px' }}
          onClick={() => bannerInputRef.current?.click()}
        >
           {branding.banner ? (
             <div className="relative w-full h-full flex items-center justify-center p-24">
               <img src={branding.banner} alt="Station Banner" className="w-full max-h-[750px] object-contain transition-transform group-hover:scale-105 duration-1000" />
               <div className="absolute bottom-16 right-16 bg-[#A2D149] text-black px-16 py-8 rounded-full font-pixel text-base opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_30px_80px_rgba(0,0,0,1)] uppercase font-black z-40">
                 PRESTIGE_BANNER_SYNCED
               </div>
             </div>
           ) : (
             <div className="w-full h-[550px] flex flex-col items-center justify-center gap-16 animate-pulse opacity-10">
                <span className="text-[20rem] grayscale">🍌</span>
                <span className="font-pixel text-5xl uppercase tracking-[2.5em] font-black">UPLOAD_FOOTER_BANNER</span>
             </div>
           )}
        </div>
        
        <div className="flex flex-col items-center gap-12 opacity-40 hover:opacity-100 transition-opacity duration-1000">
          <div className="flex gap-24">
             <span className="font-pixel text-base tracking-[1.2em] uppercase text-[#A2D149] font-black italic">PRESTIGE_STATION_v16.0</span>
             <div className="flex items-center gap-6">
                <div className="h-6 w-6 rounded-full bg-lime-500 animate-pulse shadow-[0_0_25px_#A2D149]"></div>
                <span className="font-pixel text-base tracking-[1.2em] uppercase font-black">STATION_LOCKED_IN_DNA</span>
             </div>
          </div>
          <span className="font-pixel text-[12px] tracking-[1em] uppercase text-center max-w-4xl leading-loose italic font-bold opacity-30">©2026 SEUB.CA PRODUCTION • TRANSMISSION BD SÉCURISÉE • PRESTIGE STUDIO WORLDWIDE</span>
        </div>
      </footer>

      {/* OVERLAYS */}
      {fullscreen && (
        <div className="fixed inset-0 z-[10000] bg-black/99 flex items-center justify-center p-16 cursor-zoom-out backdrop-blur-3xl animate-in zoom-in-95 duration-500" onClick={() => setFullscreen(null)}>
           <img src={fullscreen} className="max-w-full max-h-[96vh] rounded-[7rem] border-[30px] border-black shadow-[0_0_500px_rgba(162,209,73,0.5)]" />
        </div>
      )}

      {refineId && (
        <div className="fixed inset-0 z-[10000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-16 animate-in fade-in duration-500">
           <div className="bg-[#08080a] border-[20px] border-black max-w-7xl w-full p-32 rounded-[10rem] space-y-24 shadow-[0_0_500px_rgba(255,0,127,0.4)]">
              <div className="flex items-center gap-20">
                 <div className="w-24 h-24 bg-yellow-400 rounded-full animate-ping shadow-[0_0_100px_rgba(250,204,21,0.9)]"></div>
                 <h3 className="font-pixel text-[10rem] text-yellow-400 font-black tracking-tighter italic uppercase leading-none">PATCH_DNA</h3>
              </div>
              <textarea 
                autoFocus value={refinePrompt} onChange={e => setRefinePrompt(e.target.value)}
                className="w-full bg-black border-6 border-white/10 p-24 text-6xl font-black outline-none min-h-[550px] resize-none text-white rounded-[6rem] focus:border-yellow-400/50 transition-all shadow-inner italic"
                placeholder="Décrivez les mutations..."
              />
              <div className="flex gap-20">
                <button onClick={() => setRefineId(null)} className="flex-1 font-pixel text-5xl text-white/20 hover:text-white transition-colors uppercase italic underline decoration-white/10 underline-offset-[30px] font-black">ABANDONNER</button>
                <button onClick={() => handleAction(refineId, 'edit')} disabled={!!loadingId} className="flex-[3] py-20 bg-yellow-400 text-black font-pixel text-8xl rounded-[5rem] shadow-[30px_30px_0_#000] hover:scale-105 active:translate-x-5 active:translate-y-5 active:shadow-[4px_4px_0_#000] transition-all font-black italic uppercase">
                  {loadingId ? 'PATCHING...' : 'COMMIT_PATCH'}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
