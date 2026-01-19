
import React, { useState, useEffect } from 'react';
import { INITIAL_COMIC_DATA } from './constants';
import { ComicProject, ViewMode, Panel, ReferenceImages } from './types';
import { geminiService } from './services/geminiService';

const STORAGE_KEY = 'seuB_CA_GLITCH_PRO_2026_FINAL';
const REFS_KEY = 'seuB_CA_REFS_2026_FINAL';

const GlitchLogo = () => (
  <div className="relative group cursor-pointer py-6 select-none">
    <div className="absolute -inset-6 bg-gradient-to-br from-[#00E5FF] via-[#BF00FF] to-[#D1A110] blur-3xl opacity-10 group-hover:opacity-40 transition-opacity duration-700"></div>
    <div className="relative flex flex-col items-start leading-none scale-110">
      <div className="relative flex items-center">
        <span className="absolute -top-[4px] -left-[4px] font-glitch text-6xl text-[#00E5FF] opacity-50 group-hover:animate-pulse">MISSION</span>
        <span className="absolute top-[4px] left-[4px] font-glitch text-6xl text-[#BF00FF] opacity-50 group-hover:animate-bounce">MISSION</span>
        <span className="relative font-glitch text-6xl text-white tracking-wider">MISSION</span>
      </div>
      <div className="relative -mt-4 flex items-center">
        <span className="absolute -top-[4px] -left-[4px] font-glitch text-6xl text-[#D1A110] opacity-50 group-hover:animate-pulse">GLITCH</span>
        <span className="absolute top-[4px] left-[4px] font-glitch text-6xl text-[#FF10F0] opacity-50 group-hover:animate-bounce">GLITCH</span>
        <span className="relative font-glitch text-6xl text-white tracking-widest">GLITCH</span>
      </div>
      <div className="flex items-center gap-6 mt-4">
        <div className="h-[4px] w-24 bg-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.8)]"></div>
        <span className="font-mono text-[12px] tracking-[0.6em] text-[#D1A110] font-black uppercase">seuB.CA_PRESTIGE_2026</span>
      </div>
    </div>
  </div>
);

const DecorativeIcon = ({ src, className = "" }: { src: string, className?: string }) => (
  <div className="relative group/icon">
    <div className="absolute -inset-2 bg-white blur-md opacity-0 group-hover/icon:opacity-20 transition-opacity"></div>
    <img src={src} className={`w-10 h-10 object-contain pointer-events-none opacity-50 group-hover/icon:opacity-100 group-hover/icon:scale-125 transition-all duration-500 ${className}`} alt="Icon" />
  </div>
);

const NavButton = ({ active, label, icon, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-5 px-8 py-4 rounded-2xl font-mono text-[12px] font-black tracking-[0.2em] transition-all border-2 ${
      active 
      ? `bg-white text-black border-transparent shadow-[10px_10px_0px_${color}] transform -translate-y-2` 
      : 'text-white/20 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/[0.03]'
    }`}
  >
    <span className="text-2xl" style={{ color: active ? 'inherit' : color }}>{icon}</span>
    {label}
  </button>
);

export default function App() {
  const [comic, setComic] = useState<ComicProject>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_COMIC_DATA;
  });

  const [references, setReferences] = useState<ReferenceImages>(() => {
    const saved = localStorage.getItem(REFS_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  const [viewMode, setViewMode] = useState<ViewMode>('editor');
  const [activeSection, setActiveSection] = useState<'storyboard' | 'universe' | 'assets'>('storyboard');
  const [isPublishing, setIsPublishing] = useState(false);
  const [networkPing, setNetworkPing] = useState(24);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comic));
  }, [comic]);

  useEffect(() => {
    localStorage.setItem(REFS_KEY, JSON.stringify(references));
  }, [references]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkPing(Math.floor(Math.random() * 20) + 15);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const addPage = () => {
    const num = comic.pages.length;
    setComic(prev => ({
      ...prev,
      pages: [...prev.pages, {
        pageNumber: num,
        title: `PHASE_0${num + 1}`,
        panels: [{ id: `p${num}-${Date.now()}`, description: "", status: 'idle' }]
      }]
    }));
  };

  const deletePage = (idx: number) => {
    if (confirm("SUPPRIMER DÉFINITIVEMENT CETTE PHASE DE PRODUCTION ?")) {
      setComic(prev => ({
        ...prev,
        pages: prev.pages.filter((_, i) => i !== idx)
      }));
    }
  };

  const addPanel = (pageIdx: number) => {
    setComic(prev => ({
      ...prev,
      pages: prev.pages.map((p, i) => i === pageIdx ? {
        ...p,
        panels: [...p.panels, { id: `panel-${Date.now()}`, description: "", status: 'idle' }]
      } : p)
    }));
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

  const deletePanel = (id: string) => {
    setComic(prev => ({
      ...prev,
      pages: prev.pages.map(page => ({
        ...page,
        panels: page.panels.filter(p => p.id !== id)
      }))
    }));
  };

  const handleShare = async () => {
    const shareData = {
      title: 'MISSION GLITCH : SEB & NADIA EN GASPÉSIE',
      text: 'Découvre notre BD interactive produite avec Gemini IA !',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Lien copié dans le presse-papier !");
      }
    } catch (err) {
      console.error('Error sharing', err);
    }
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setViewMode('reader');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2500);
  };

  const generateImage = async (id: string) => {
    const panel = comic.pages.flatMap(p => p.panels).find(p => p.id === id);
    if (!panel) return;
    updatePanel(id, { status: 'generating' });
    try {
      const refList: {data: string, mimeType: string}[] = [];
      if (references.seb) refList.push({ data: references.seb, mimeType: 'image/jpeg' });
      if (references.nadia) refList.push({ data: references.nadia, mimeType: 'image/jpeg' });
      if (references.eevee) refList.push({ data: references.eevee, mimeType: 'image/jpeg' });
      const url = await geminiService.generatePanelImage(panel.description, comic.style, comic.globalContext, refList);
      updatePanel(id, { imageUrl: url, status: 'completed' });
    } catch (e) {
      updatePanel(id, { status: 'error' });
    }
  };

  const handleManualUpload = (id: string) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => updatePanel(id, { imageUrl: reader.result as string, status: 'completed' });
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleRefUpload = (key: keyof ReferenceImages) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => setReferences(prev => ({ ...prev, [key]: reader.result as string }));
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#00E5FF] selection:text-black">
      
      {/* ELITE PRODUCTION HEADER */}
      <header className="no-print sticky top-0 z-[100] bg-black/98 border-b-2 border-white/5 backdrop-blur-3xl px-12 py-8 flex flex-col 3xl:flex-row items-center justify-between gap-12">
        <div className="flex flex-col xl:flex-row items-center gap-20">
          <GlitchLogo />
          <nav className="flex items-center gap-6 bg-white/[0.02] p-2 rounded-3xl border border-white/10 shadow-2xl">
            <NavButton 
              label="STORYBOARD" icon="✦" color="#00E5FF" 
              active={activeSection === 'storyboard' && viewMode === 'editor'} 
              onClick={() => {setViewMode('editor'); setActiveSection('storyboard');}} 
            />
            <NavButton 
              label="UNIVERS" icon="◎" color="#D1A110" 
              active={activeSection === 'universe' && viewMode === 'editor'} 
              onClick={() => {setViewMode('editor'); setActiveSection('universe');}} 
            />
            <NavButton 
              label="HÉBERGEMENT_PRO" icon="◈" color="#BF00FF" 
              active={activeSection === 'assets' && viewMode === 'editor'} 
              onClick={() => {setViewMode('editor'); setActiveSection('assets');}} 
            />
          </nav>
        </div>

        <div className="flex items-center gap-14">
          <div className="flex gap-8 opacity-40 hover:opacity-100 transition-all duration-700">
            <DecorativeIcon src="ufo.png" />
            <DecorativeIcon src="alien_outline.png" />
            <DecorativeIcon src="bomb.png" />
          </div>
          <div className="h-14 w-[2px] bg-white/10 hidden xl:block"></div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setViewMode(viewMode === 'editor' ? 'reader' : 'editor')}
              className={`px-10 py-4 font-mono text-[12px] font-black tracking-[0.4em] rounded-xl border-2 transition-all duration-500 ${viewMode === 'reader' ? 'bg-[#00FFA3] text-black border-transparent shadow-[6px_6px_0px_#000] scale-105' : 'text-white/40 border-white/10 hover:text-white hover:bg-white/5 uppercase hover:border-white/30'}`}
            >
              {viewMode === 'editor' ? 'MODALITÉ_PREVIEW' : 'RETOUR_STUDIO'}
            </button>
            <button 
              onClick={handlePublish}
              data-text="PUBLIER_APP"
              className="btn-glitch px-14 py-4 text-[15px] font-comic tracking-[0.3em] shadow-none"
            >
              PUBLIER
            </button>
          </div>
        </div>
      </header>

      {/* FINAL PUBLISHING OVERLAY */}
      {isPublishing && (
        <div className="fixed inset-0 z-[2000] bg-black flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-700 backdrop-blur-3xl">
           <div className="relative">
              <div className="w-48 h-48 border-[15px] border-[#00E5FF] border-t-transparent animate-spin rounded-full shadow-[0_0_120px_rgba(0,229,255,0.7)]"></div>
              <div className="absolute inset-0 flex items-center justify-center font-glitch text-4xl text-white">2026</div>
           </div>
           <div className="text-center space-y-6">
              <h2 className="font-glitch text-7xl text-white tracking-[0.5em] animate-pulse">SÉCURISATION</h2>
              <p className="font-mono text-sm text-[#00E5FF] tracking-[0.6em] uppercase font-black">Transfert des données vers seuB.CA_Mainframe...</p>
              <div className="w-80 h-1 bg-white/10 mx-auto rounded-full overflow-hidden">
                <div className="h-full bg-[#00E5FF] animate-progress w-full shadow-[0_0_10px_#00E5FF]"></div>
              </div>
           </div>
        </div>
      )}

      <main className="flex-grow p-8 md:p-20 relative z-10 overflow-x-hidden">
        
        {viewMode === 'editor' ? (
          <div className="max-w-[1700px] mx-auto space-y-32 animate-in fade-in slide-in-from-top-20 duration-1000">
            
            {/* UNIVERSE SPECS */}
            {activeSection === 'universe' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                <div className="studio-panel p-16 rounded-[3rem] space-y-10 border-l-[8px] border-l-[#00E5FF] shadow-[0_0_80px_rgba(0,229,255,0.05)]">
                  <div className="flex items-center justify-between">
                    <div>
                       <h3 className="font-mono text-sm text-[#00E5FF] tracking-[0.6em] uppercase font-black">Directive_Artistique</h3>
                       <p className="text-[11px] text-white/30 uppercase mt-2 tracking-[0.2em]">Engine Rendering Protocol v.2026</p>
                    </div>
                    <DecorativeIcon src="pistol.png" className="w-12 h-12 rotate-12" />
                  </div>
                  <textarea 
                    value={comic.style}
                    onChange={e => setComic({...comic, style: e.target.value})}
                    className="w-full h-96 bg-black/60 border-2 border-white/5 p-10 text-lg font-mono text-white placeholder:text-white/10 focus:border-[#00E5FF] focus:bg-black/80 outline-none transition-all rounded-[2rem] resize-none leading-relaxed shadow-inner"
                  />
                </div>
                <div className="studio-panel p-16 rounded-[3rem] space-y-10 border-l-[8px] border-l-[#D1A110] shadow-[0_0_80px_rgba(209,161,16,0.05)]">
                  <div className="flex items-center justify-between">
                    <div>
                       <h3 className="font-mono text-sm text-[#D1A110] tracking-[0.6em] uppercase font-black">Base_Narrative</h3>
                       <p className="text-[11px] text-white/30 uppercase mt-2 tracking-[0.2em]">Contextual Matrix Persistence</p>
                    </div>
                    <DecorativeIcon src="alien_solid.png" className="w-12 h-12 -rotate-12" />
                  </div>
                  <textarea 
                    value={comic.globalContext}
                    onChange={e => setComic({...comic, globalContext: e.target.value})}
                    className="w-full h-96 bg-black/60 border-2 border-white/5 p-10 text-lg font-mono text-white placeholder:text-white/10 focus:border-[#D1A110] focus:bg-black/80 outline-none transition-all rounded-[2rem] resize-none leading-relaxed shadow-inner"
                  />
                </div>
              </div>
            )}

            {/* ASSET SYNC & DEPLOYMENT GUIDE */}
            {activeSection === 'assets' && (
              <div className="space-y-16">
                <div className="studio-panel p-20 rounded-[4rem] max-w-6xl mx-auto space-y-20 border-t-[10px] border-t-[#BF00FF] shadow-[0_0_150px_rgba(191,0,255,0.15)]">
                  <div className="text-center space-y-6">
                    <h3 className="font-glitch text-8xl text-white tracking-[0.3em] uppercase">SYNC_TERMINAL</h3>
                    <p className="font-mono text-[13px] text-[#BF00FF] uppercase tracking-[1em] font-black animate-pulse">Synchronisation de l'identité visuelle 2026</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    {['seb', 'nadia', 'eevee'].map((k) => (
                      <div key={k} className="flex flex-col items-center gap-10 group">
                        <div 
                          onClick={() => handleRefUpload(k as any)}
                          className={`w-full aspect-square bg-benday rounded-[3rem] border-4 border-dashed transition-all duration-700 cursor-pointer flex items-center justify-center overflow-hidden relative shadow-2xl ${references[k as keyof ReferenceImages] ? 'border-[#BF00FF] border-solid shadow-[0_0_80px_rgba(191,0,255,0.4)]' : 'border-white/5 hover:border-[#BF00FF]/50 hover:bg-white/[0.03]'}`}
                        >
                          {references[k as keyof ReferenceImages] ? (
                            <img src={references[k as keyof ReferenceImages]} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-[2s]" alt="Ref" />
                          ) : (
                            <div className="flex flex-col items-center gap-8 text-white/5 group-hover:text-white/50 transition-all scale-110">
                              <span className="text-9xl font-comic">+</span>
                              <span className="font-mono text-xs font-black uppercase tracking-[0.5em]">SYNC_{k}</span>
                            </div>
                          )}
                          <div className="absolute top-6 right-6 px-5 py-2.5 bg-black/90 backdrop-blur-2xl rounded-2xl text-[10px] font-mono text-white/70 border-2 border-white/10 uppercase tracking-[0.3em] font-black">REF_ARCHIVE</div>
                        </div>
                        <span className="font-mono text-base font-black text-white/20 uppercase tracking-[0.8em] group-hover:text-[#BF00FF] group-hover:tracking-[1em] transition-all duration-500">{k}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DEPLOYMENT GUIDE FOR ENGINEERS */}
                <div className="studio-panel p-20 rounded-[4rem] max-w-6xl mx-auto space-y-12 border-t-[10px] border-t-[#00FFA3] shadow-[0_0_150px_rgba(0,255,163,0.15)]">
                   <div className="flex items-center justify-between border-b border-white/10 pb-10">
                      <div>
                        <h3 className="font-glitch text-5xl text-white tracking-widest uppercase">HÉBERGEMENT_PRO</h3>
                        <p className="font-mono text-sm text-[#00FFA3] uppercase tracking-[0.5em] font-black">Déploiement sur un URL Public seuB.CA</p>
                      </div>
                      <DecorativeIcon src="ufo.png" className="w-16 h-16" />
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 font-mono text-sm">
                      <div className="space-y-6">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                          <h4 className="text-[#00FFA3] font-black mb-4 uppercase tracking-widest">Étape 1: Télécharger le code</h4>
                          <p className="text-white/60 leading-relaxed">En tant qu'ingénieur, tu peux copier les fichiers <span className="text-white font-bold">App.tsx, index.html, services/geminiService.ts</span> etc. dans un projet React/Vite local.</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                          <h4 className="text-[#00FFA3] font-black mb-4 uppercase tracking-widest">Étape 2: Push sur GitHub</h4>
                          <p className="text-white/60 leading-relaxed">Crée un repo privé ou public pour sécuriser tes assets. C'est la base pour avoir un déploiement continu.</p>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                          <h4 className="text-[#00FFA3] font-black mb-4 uppercase tracking-widest">Étape 3: Connecter Vercel</h4>
                          <p className="text-white/60 leading-relaxed">Va sur <a href="https://vercel.com" target="_blank" className="underline text-[#00E5FF]">Vercel.com</a>. Importe ton repo. Ils vont te générer un URL instantanément (ex: <span className="italic text-white">mission-glitch.vercel.app</span>).</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                          <h4 className="text-[#00FFA3] font-black mb-4 uppercase tracking-widest">Étape 4: Configurer l'API</h4>
                          <p className="text-white/60 leading-relaxed">Dans les réglages de ton projet Vercel, ajoute la variable <span className="text-[#BF00FF] font-bold">API_KEY</span> avec ta clé Gemini pour que l'IA fonctionne en prod.</p>
                        </div>
                      </div>
                   </div>
                   
                   <div className="bg-black/60 p-8 rounded-[2rem] border-2 border-dashed border-white/10 text-center">
                      <p className="font-mono text-xs text-white/40 uppercase tracking-[0.4em] mb-6">Prêt pour la mise en ligne, bro ?</p>
                      <button onClick={handleShare} className="btn-glitch px-12 py-5 text-lg font-comic tracking-[0.3em]">TESTER_PARTAGE_NATIF</button>
                   </div>
                </div>
              </div>
            )}

            {/* STORYBOARD */}
            {activeSection === 'storyboard' && (
              <div className="space-y-48 pb-80">
                {comic.pages.map((page, pIdx) => (
                  <section key={pIdx} className="space-y-24 group/page animate-in slide-in-from-bottom-24 duration-1000">
                    <div className="flex items-center justify-between border-b-4 border-white/5 pb-14">
                      <div className="flex items-center gap-16">
                        <div className="font-glitch text-[12rem] text-white/5 group-hover/page:text-[#00E5FF]/10 transition-all select-none leading-none drop-shadow-2xl">0{pIdx + 1}</div>
                        <div className="flex flex-col">
                           <span className="font-mono text-sm text-[#00E5FF] tracking-[0.8em] font-black mb-5 uppercase opacity-60">SÉQUENCE_ENGINE_V26</span>
                           <input 
                              value={page.title}
                              onChange={e => {
                                const p = [...comic.pages]; p[pIdx].title = e.target.value; setComic({...comic, pages: p});
                              }}
                              className="bg-transparent border-none font-comic text-8xl text-white/90 focus:text-[#00E5FF] outline-none uppercase tracking-tighter w-full max-w-4xl transition-all hover:text-white"
                           />
                        </div>
                      </div>
                      <button onClick={() => deletePage(pIdx)} className="font-mono text-xs text-white/20 hover:text-red-500 border-4 border-white/5 px-10 py-5 rounded-3xl uppercase tracking-[0.4em] transition-all hover:bg-red-500/10 hover:border-red-500/50 font-black">EJECT_PHASE</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 3xl:grid-cols-3 gap-24">
                      {page.panels.map(panel => (
                        <div key={panel.id} className="studio-panel flex flex-col rounded-[4rem] overflow-hidden group shadow-[0_60px_150px_rgba(0,0,0,0.8)] relative border-b-[12px] border-b-transparent hover:border-b-[#00E5FF]">
                          
                          {/* PANEL PREVIEW */}
                          <div className="aspect-square bg-benday relative overflow-hidden bg-[#030305]">
                            <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400%] h-12 bg-white rotate-[45deg]"></div>
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400%] h-12 bg-white -rotate-[45deg]"></div>
                            </div>

                            {panel.imageUrl ? (
                              <img src={panel.imageUrl} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-[25s]" alt="Frame" />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.12]">
                                <span className="font-glitch text-[20rem] text-white">?</span>
                                <span className="font-mono text-sm tracking-[2.5em] -mt-24 uppercase font-black">Buffer_Void</span>
                              </div>
                            )}

                            {/* GPU OVERLAY */}
                            {panel.status === 'generating' && (
                              <div className="absolute inset-0 bg-black/98 flex flex-col items-center justify-center z-50">
                                <div className="w-32 h-32 border-[15px] border-[#00E5FF] border-t-transparent animate-spin rounded-full shadow-[0_0_120px_rgba(0,229,255,0.7)]"></div>
                                <span className="font-glitch text-6xl text-[#00E5FF] mt-12 animate-pulse tracking-[0.4em] uppercase">RENDER_ACTIF</span>
                              </div>
                            )}

                            {/* TOOLBAR */}
                            <div className="absolute top-10 right-10 flex gap-6 opacity-0 group-hover:opacity-100 transition-all z-30 translate-y-[-20px] group-hover:translate-y-0">
                              <button onClick={() => handleManualUpload(panel.id)} className="p-6 bg-black/95 hover:bg-[#00E5FF] hover:text-black rounded-3xl transition-all border-4 border-white/10 shadow-2xl">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                              </button>
                              <button onClick={() => deletePanel(panel.id)} className="p-6 bg-black/95 hover:bg-red-500 text-white rounded-3xl transition-all border-4 border-white/10 shadow-2xl">
                                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                            
                            <DecorativeIcon src="ufo.png" className="absolute bottom-12 left-12 w-16 h-16 group-hover:scale-175 transition-transform rotate-[20deg] opacity-30 group-hover:opacity-100 shadow-2xl" />
                          </div>

                          {/* SCRIPTING */}
                          <div className="p-12 space-y-10 bg-black/60 border-t-4 border-white/5">
                            <div className="relative">
                              <textarea 
                                value={panel.description}
                                onChange={(e: any) => updatePanel(panel.id, { description: e.target.value })}
                                className="w-full h-44 bg-white/[0.03] border-4 border-white/5 p-8 text-xl font-mono text-white placeholder:text-white/10 focus:border-[#00E5FF] focus:bg-white/[0.05] outline-none resize-none rounded-[2rem] transition-all leading-relaxed shadow-inner"
                                placeholder="STORYBOARD_LOG: Détaillez la scène, l'action, l'émotion..."
                              />
                              <div className="absolute bottom-6 right-8 font-mono text-[10px] text-[#00E5FF]/40 uppercase tracking-[0.6em] font-black">Studio_v26_Core</div>
                            </div>
                            <button 
                              onClick={() => generateImage(panel.id)}
                              data-text={panel.imageUrl ? 'RECOMPILER_ASSET' : 'INITIALISER_L_IMAGE'}
                              className="btn-glitch w-full py-6 text-lg font-comic tracking-[0.3em] shadow-none"
                            >
                              {panel.imageUrl ? 'RECOMPILER_ASSET' : 'INITIALISER_L_IMAGE'}
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {/* APPEND FRAME */}
                      <button 
                        onClick={() => addPanel(pIdx)}
                        className="aspect-square border-[10px] border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center hover:border-[#00E5FF]/50 hover:bg-[#00E5FF]/5 transition-all group/add shadow-inner bg-benday relative group"
                      >
                        <span className="font-glitch text-[15rem] text-white/5 group-hover/add:text-[#00E5FF] transition-all transform group-hover/add:scale-110 duration-1000 leading-none drop-shadow-2xl">+</span>
                        <span className="font-mono text-sm text-white/30 uppercase tracking-[1.2em] mt-10 group-hover/add:text-white transition-colors font-black">APPEND_FRAME_X26</span>
                        <DecorativeIcon src="bomb.png" className="absolute top-14 right-14 opacity-5 group-hover/add:opacity-30 group-hover/add:rotate-90 transition-all scale-150" />
                      </button>
                    </div>
                  </section>
                ))}
                
                <button 
                  onClick={addPage}
                  className="w-full py-40 border-[12px] border-dashed border-white/5 rounded-[5rem] font-glitch text-8xl text-white/5 hover:text-[#BF00FF] hover:border-[#BF00FF]/50 transition-all uppercase flex items-center justify-center gap-20 group/new shadow-inner"
                >
                  <span className="animate-pulse group-hover/new:text-[#BF00FF]">◈◈◈</span>
                  INSERT_NEW_SEQUENCE_2026
                  <span className="animate-pulse group-hover/new:text-[#BF00FF]">◈◈◈</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* CINEMATIC PUBLISHED READER */
          <div className="max-w-[1600px] mx-auto py-40 space-y-[40rem]">
            {comic.pages.map((page, idx) => (
              <div key={idx} className="space-y-48 px-12">
                <div className="flex flex-col items-center relative">
                  <h2 className="font-glitch text-9xl md:text-[18rem] text-white tracking-tighter text-center leading-none select-none drop-shadow-[0_0_80px_rgba(255,255,255,0.2)]">{page.title}</h2>
                  <div className="w-[40rem] h-4 bg-gradient-to-r from-transparent via-[#00E5FF] to-transparent mt-24 blur-[8px] shadow-[0_0_120px_#00E5FF]"></div>
                  <DecorativeIcon src="alien_outline.png" className="absolute -top-40 right-10 w-48 h-48 opacity-20 scale-150" />
                </div>
                
                <div className={`grid gap-40 ${page.panels.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {page.panels.map(p => (
                    <div key={p.id} className="relative group overflow-hidden bg-black border-[30px] border-black shadow-[120px_120px_0px_rgba(0,0,0,1)] hover:scale-[1.05] transition-all duration-1000 cursor-none">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} className="w-full h-full object-cover transition-all duration-[50s] group-hover:scale-150" alt="Frame" />
                      ) : (
                        <div className="aspect-square flex items-center justify-center bg-[#010101] text-white/5 font-glitch text-[20rem] uppercase tracking-tighter select-none">NULL_SYNC</div>
                      )}
                      
                      {/* CAPTION BLOCK */}
                      <div className="absolute bottom-16 left-16 right-16 p-20 bg-white border-[10px] border-black text-black opacity-0 group-hover:opacity-100 transition-all duration-1000 transform translate-y-40 group-hover:translate-y-0 shadow-[40px_40px_0px_rgba(0,0,0,1)]">
                         <div className="flex justify-between items-center mb-10 opacity-50">
                            <span className="font-mono text-sm font-black uppercase tracking-[1em]">Publication_PRESTIGE_seuB.CA_2026</span>
                            <DecorativeIcon src="pistol.png" className="w-12 h-12 grayscale" />
                         </div>
                         <p className="font-comic text-5xl md:text-7xl uppercase leading-[0.85] tracking-tight text-black">{p.description}</p>
                         <div className="mt-14 font-mono text-[13px] font-black border-t-8 border-black/10 pt-10 tracking-[0.6em] flex justify-between items-center">
                            <div className="flex items-center gap-6">
                               <div className="w-5 h-5 bg-black animate-ping rounded-full"></div>
                               <span className="tracking-[0.8em]">CORE_SYNC_LIVE</span>
                            </div>
                            <span>PROTOCOL_ID: {p.id.split('-')[1]?.substring(0,8)}</span>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="text-center pt-[30rem] opacity-10 hover:opacity-100 transition-opacity duration-[5s] select-none pb-[50rem]">
              <span className="font-glitch text-[30vw] text-white tracking-[8rem] drop-shadow-[0_0_150px_rgba(255,255,255,0.4)]">FIN</span>
              <div className="mt-40 font-comic text-6xl text-white/30 tracking-[1.5em] uppercase">seuB.CA ÉLITE PRODUCTION 2026</div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER HUD */}
      <footer className="no-print bg-black/98 border-t-4 border-white/5 p-12 flex flex-col xl:flex-row justify-between items-center px-20 z-[120] backdrop-blur-3xl shadow-[0_-40px_150px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-24 font-mono text-[12px] tracking-[0.5em]">
          <div className="flex flex-col">
            <span className="text-[#00E5FF] font-black mb-2.5 shadow-[0_0_15px_#00E5FF] uppercase">System_Link</span>
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse shadow-[0_0_10px_#00E5FF]"></div>
               <span className="text-white/60 uppercase">ONLINE_EST_2026_0XFF</span>
            </div>
          </div>
          <div className="w-[3px] h-12 bg-white/10 hidden md:block"></div>
          <div className="flex flex-col">
            <span className="text-[#D1A110] font-black mb-2.5 shadow-[0_0_15px_#D1A110] uppercase">Network_Latency</span>
            <span className="text-white/60 uppercase">{networkPing}MS_SYNC_RATE</span>
          </div>
          <div className="w-[3px] h-12 bg-white/10 hidden lg:block"></div>
          <div className="flex flex-col hidden lg:flex">
            <span className="text-[#BF00FF] font-black mb-2.5 shadow-[0_0_15px_#BF00FF] uppercase">Frame_Assets</span>
            <span className="text-white/60 uppercase">{comic.pages.flatMap(p => p.panels).length}_PANELS_SYNCHRONIZED</span>
          </div>
        </div>
        
        <div className="flex items-center gap-10 mt-12 xl:mt-0">
          <button 
            onClick={handleShare}
            className="flex items-center gap-4 bg-white/5 px-8 py-4 rounded-2xl border-2 border-white/10 hover:bg-[#00E5FF] hover:text-black hover:border-black transition-all group/share"
          >
             <span className="font-mono text-[12px] font-black uppercase tracking-widest">Partager_URL</span>
             <svg className="w-6 h-6 group-hover/share:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </button>
          
          <div className="text-right hidden sm:block">
            <div className="font-mono text-[11px] text-white/10 uppercase tracking-[1em] mb-4 font-black">Elite_Creative_Archive_seuB.CA</div>
            <div className="font-comic text-5xl text-white/40 group hover:text-[#00E5FF] transition-all cursor-none tracking-[0.4em] flex items-center gap-8">
              seuB.CA <span className="text-[#D1A110] text-4xl animate-pulse">©2026</span>
            </div>
          </div>
        </div>
      </footer>

      {/* VERTICAL WATERMARK */}
      <div className="fixed top-1/2 -right-32 transform rotate-90 origin-center no-print opacity-[0.05] select-none pointer-events-none z-0">
        <span className="font-glitch text-[25vw] text-white tracking-[5vw]">seuB.CA_MISSION_GLITCH_PRO_2026</span>
      </div>
    </div>
  );
}
