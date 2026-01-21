
import React, { useState, useEffect } from 'react';
import { INITIAL_COMIC_DATA } from './constants';
import { ComicProject, ViewMode, Panel } from './types';
import { geminiService } from './services/geminiService';
import { audioService } from './services/audioService';

const STORAGE_KEY = 'MBDM_ULTRA_STATION_V12';
const BRANDING_KEY = 'MBDM_ULTRA_BRAND_V12';

interface Branding {
  van?: string;
  square?: string;
  banner?: string;
  title?: string;
}

export default function App() {
  const [comic, setComic] = useState<ComicProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_COMIC_DATA;
    } catch {
      return INITIAL_COMIC_DATA;
    }
  });

  const [branding, setBranding] = useState<Branding>(() => {
    try {
      const saved = localStorage.getItem(BRANDING_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [activeTab, setActiveTab] = useState<'studio' | 'assets'>('studio');
  const [viewMode, setViewMode] = useState<'editor' | 'reader'>('editor');
  const [fullscreen, setFullscreen] = useState<string | null>(null);
  const [refineId, setRefineId] = useState<string | null>(null);
  const [refinePrompt, setRefinePrompt] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comic));
  }, [comic]);

  useEffect(() => {
    if (Object.keys(branding).length > 0) {
      localStorage.setItem(BRANDING_KEY, JSON.stringify(branding));
    }
  }, [branding]);

  const handleLogoUpload = (type: keyof Branding) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          setBranding(prev => ({ ...prev, [type]: re.target?.result as string }));
          audioService.playDoneGen();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
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
      const url = await geminiService.generatePanelImage(prompt, comic.style, comic.globalContext, refs, mode === 'edit');
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
    <div className="min-h-screen flex flex-col">
      
      {/* HEADER MASTER : BRAND GAUCHE / NAV DROITE */}
      <header className="app-master-header">
        
        {/* BRANDING UNIT (GAUCHE) */}
        <div className="brand-citadel">
          <div className="cursor-pointer" onClick={() => handleLogoUpload('van')}>
            {branding.van ? (
              <img src={branding.van} alt="Van" className="logo-van-mega" />
            ) : (
              <div className="h-[120px] w-[180px] border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-[10px] font-pixel text-white/20 bg-white/5 hover:border-lime-500/30 transition-all">
                <span className="text-4xl mb-2">🚐</span>
                UPLOAD_VAN
              </div>
            )}
          </div>
          <div className="cursor-pointer" onClick={() => handleLogoUpload('title')}>
            {branding.title ? (
              <img src={branding.title} alt="Title" className="logo-title-mega" />
            ) : (
              <div className="h-[90px] w-[400px] border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-xs font-pixel text-white/20 bg-white/5 hover:border-pink-500/30 transition-all">
                UPLOAD_STATION_TITLE
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION & ACTION (DROITE) */}
        <div className="flex items-center gap-10">
          <nav className="nav-island">
            <button 
              onClick={() => { audioService.playNav(); setActiveTab('studio'); }}
              className={`nav-btn ${activeTab === 'studio' ? 'active' : ''}`}
            >
              STUDIO_CORE
            </button>
            <button 
              onClick={() => { audioService.playNav(); setActiveTab('assets'); }}
              className={`nav-btn ${activeTab === 'assets' ? 'active' : ''}`}
            >
              ASSETS_DB
            </button>
          </nav>

          <button 
            onClick={() => { audioService.playNav(); setViewMode(viewMode === 'editor' ? 'reader' : 'editor'); }}
            className="btn-primary-action"
          >
            {viewMode === 'editor' ? 'RENDER_STORY' : 'BACK_TO_SYNC'}
          </button>
        </div>
      </header>

      <main className="flex-grow p-8 max-w-[1600px] mx-auto w-full">
        {activeTab === 'assets' ? (
          <div className="py-12 space-y-24 flex flex-col items-center">
            <div className="relative cursor-pointer group" onClick={() => handleLogoUpload('square')}>
               {branding.square ? (
                 <img src={branding.square} alt="Square" className="w-[450px] rounded-3xl shadow-2xl border-8 border-black hover:scale-105 transition-all" />
               ) : (
                 <div className="w-[300px] aspect-square border-4 border-dashed border-white/10 rounded-3xl flex items-center justify-center font-pixel text-white/10 bg-white/5">UPLOAD_SQUARE_DNA</div>
               )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full">
              {['SEB', 'NADIA', 'EEVEE'].map(name => (
                <div key={name} className="bg-zinc-900/50 p-10 rounded-3xl border border-white/5 flex flex-col items-center gap-6">
                   <div className="w-full aspect-square bg-black/40 rounded-2xl flex items-center justify-center border-2 border-black">
                      <span className="text-[10rem] text-white/5 font-pixel">{name[0]}</span>
                   </div>
                   <h3 className="font-comic text-7xl text-white tracking-tighter">{name}</h3>
                </div>
              ))}
            </div>
          </div>
        ) : viewMode === 'editor' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* BRIEFING D'ARRIVÉE */}
            <div className="mission-briefing-box">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-4 h-4 bg-lime-500 rounded-full animate-pulse"></div>
                  <h2 className="font-pixel text-2xl text-white uppercase tracking-widest">System_Briefing : Comment créer votre BD</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  <div className="space-y-2">
                    <span className="font-pixel text-lime-500 text-xs">01_PLOT</span>
                    <p className="text-sm text-white/70">Écrivez une description visuelle pour chaque panel. Soyez précis sur l'action et l'ambiance.</p>
                  </div>
                  <div className="space-y-2">
                    <span className="font-pixel text-pink-500 text-xs">02_SYNC</span>
                    <p className="text-sm text-white/70">Cliquez sur <strong className="text-white">GENERATE</strong>. Notre IA transforme vos mots en art prestige instantanément.</p>
                  </div>
                  <div className="space-y-2">
                    <span className="font-pixel text-turq text-xs">03_RENDER</span>
                    <p className="text-sm text-white/70">Une fois prêt, utilisez <strong className="text-white">RENDER_STORY</strong> en haut à droite pour voir votre œuvre en plein écran.</p>
                  </div>
               </div>
            </div>

            {/* STUDIO ENGINE */}
            {comic.pages.map((page, pIdx) => (
              <section key={pIdx} className="space-y-10 mb-32">
                <div className="flex items-center gap-6 border-b border-white/5 pb-4">
                  <span className="font-pixel text-xs text-white/20 tracking-widest">SEQ_ID_0{pIdx+1}</span>
                  <input 
                    value={page.title} 
                    onChange={e => {
                      const pages = [...comic.pages]; pages[pIdx].title = e.target.value; setComic({...comic, pages});
                    }} 
                    className="bg-transparent border-none text-2xl font-pixel focus:outline-none text-white/40 hover:text-white transition-all w-full uppercase"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {page.panels.map(panel => (
                    <div key={panel.id} className="panel-card flex flex-col group relative rounded-2xl overflow-hidden shadow-2xl">
                      <div className="aspect-square relative bg-zinc-950">
                        {panel.imageUrl ? (
                          <>
                            <img src={panel.imageUrl} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-6 backdrop-blur-md">
                               <button onClick={() => setFullscreen(panel.imageUrl!)} className="px-10 py-3 bg-white text-black font-pixel text-xs rounded-md shadow-xl hover:scale-105 active:scale-95 transition-all">PREVIEW</button>
                               <button onClick={() => setRefineId(panel.id)} className="px-10 py-3 bg-[#F7C600] text-black font-pixel text-xs rounded-md shadow-xl hover:scale-105 active:scale-95 transition-all">PATCH_CORE</button>
                            </div>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10">
                            <span className="text-[12rem] font-pixel">+</span>
                          </div>
                        )}
                        {loadingId === panel.id && (
                          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50">
                             <div className="w-20 h-20 border-4 border-white/10 border-t-lime-500 animate-spin rounded-full mb-6"></div>
                             <span className="font-pixel text-xs animate-pulse text-lime-500 tracking-[0.5em]">SYNCING_DNA</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 space-y-6">
                        <textarea 
                          placeholder="Décrivez votre scène (ex: Le van traverse un désert de néons...)"
                          value={panel.description}
                          onChange={e => updatePanel(panel.id, { description: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 p-5 text-base font-medium leading-relaxed focus:border-lime-500/50 outline-none min-h-[140px] resize-none text-white/90 rounded-xl transition-all"
                        />
                        <button onClick={() => handleAction(panel.id, 'new')} disabled={!!loadingId} className="w-full py-5 text-3xl font-pixel bg-[#FF007F] text-white hover:brightness-110 active:scale-95 transition-all uppercase italic font-black rounded-xl shadow-lg border-b-8 border-black">
                          GENERATE_DNA
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => {
                    const pages = [...comic.pages];
                    pages[pIdx].panels.push({ id: `p-${Date.now()}`, description: "", status: 'idle' });
                    setComic({...comic, pages});
                  }} className="aspect-square border-4 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center hover:bg-white/5 hover:border-lime-500/30 transition-all group">
                    <span className="text-8xl opacity-10 group-hover:opacity-30 font-pixel transition-all">+</span>
                    <span className="font-pixel text-xs mt-4 opacity-5 group-hover:opacity-20 uppercase tracking-widest">ADD_PANEL</span>
                  </button>
                </div>
              </section>
            ))}
            <div className="py-20 flex justify-center">
               <button onClick={() => { audioService.playAddPage(); setComic(prev => ({...prev, pages: [...prev.pages, { pageNumber: prev.pages.length + 1, title: `NEW_SEQUENCE`, panels: [{ id: `p-${Date.now()}`, description: "", status: 'idle' }] }] })); }} className="px-14 py-6 text-3xl font-pixel bg-transparent border-2 border-white/10 text-white/30 hover:text-white hover:border-white transition-all rounded-2xl flex items-center gap-6">
                 <span className="text-4xl">+</span> APPEND_CORE_SEQUENCE
               </button>
            </div>
          </div>
        ) : (
          <div className="max-w-[1100px] mx-auto py-12 space-y-32 animate-in fade-in zoom-in-95 duration-1000">
            {comic.pages.map((page, idx) => (
              <div key={idx} className="space-y-12">
                <h2 className="text-center font-comic text-8xl text-white/20 uppercase tracking-tight">{page.title}</h2>
                <div className="space-y-24">
                  {page.panels.map(p => (
                    <div key={p.id} className="bg-black border-[30px] border-black shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden rounded-[4rem]">
                      {p.imageUrl && <img src={p.imageUrl} className="w-full" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="p-24 border-t border-white/5 flex flex-col items-center gap-12 bg-black/40">
        <div className="w-full max-w-[1200px] cursor-pointer group" onClick={() => handleLogoUpload('banner')}>
           {branding.banner ? (
             <img src={branding.banner} alt="Banner" className="w-full h-[250px] object-contain transition-transform group-hover:scale-[1.02]" />
           ) : (
             <div className="w-full h-[120px] border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-xs font-pixel text-white/10 hover:bg-white/5 transition-all">
               UPLOAD_FOOTER_BANNER
             </div>
           )}
        </div>
        <div className="flex flex-col items-center gap-2 opacity-30">
          <span className="font-pixel text-[10px] tracking-[0.5em] uppercase">MBDM_STATION_CORE_v12.0</span>
          <span className="font-pixel text-[8px] tracking-[0.3em] uppercase">©2026 SEUB.CA PRODUCTION • ALL_DNA_SYNCED</span>
        </div>
      </footer>

      {fullscreen && (
        <div className="fixed inset-0 z-[2000] bg-black/98 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-3xl animate-in fade-in duration-300" onClick={() => setFullscreen(null)}>
           <img src={fullscreen} className="max-w-full max-h-[92vh] rounded-2xl shadow-[0_0_100px_rgba(162,209,73,0.3)] border-8 border-white/10" />
        </div>
      )}

      {refineId && (
        <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in zoom-in-95 duration-300">
           <div className="bg-[#0a0a0d] border-4 border-white/5 max-w-3xl w-full p-12 rounded-[3rem] space-y-8 shadow-[0_0_150px_rgba(255,0,127,0.2)]">
              <div className="flex items-center gap-4">
                 <div className="w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                 <h3 className="font-pixel text-4xl text-yellow-400 uppercase font-black">REFINEMENT_ENGINE</h3>
              </div>
              <textarea 
                autoFocus
                value={refinePrompt}
                onChange={e => setRefinePrompt(e.target.value)}
                className="w-full bg-black border-2 border-white/10 p-8 text-2xl font-bold outline-none min-h-[300px] resize-none text-white rounded-3xl focus:border-yellow-400/50 transition-all"
                placeholder="Ex: Change Seb's hair color to blue or add more neon pink glow..."
              />
              <div className="flex gap-6 pt-4">
                <button onClick={() => setRefineId(null)} className="flex-1 font-pixel text-lg text-white/20 hover:text-white transition-colors">CANCEL_ABORT</button>
                <button onClick={() => handleAction(refineId, 'edit')} disabled={!!loadingId} className="flex-[3] py-6 bg-yellow-400 text-black font-pixel text-4xl rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-[8px_8px_0_#000]">
                  {loadingId ? 'PATCHING...' : 'COMMIT_PATCH'}
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
