
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

  const downloadProject = () => {
    const data = {
      project: comic,
      references: references,
      meta: {
        exportedAt: new Date().toISOString(),
        version: "2026.ELITE.FINAL"
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MISSION_GLITCH_BACKUP_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
    if (confirm("SUPPRIMER DÉFINITIVEMENT CETTE PHASE ?")) {
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
      title: 'MISSION GLITCH : PRESTIGE 2026',
      text: 'Génération de BD IA Haute-Fidélité',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("URL de l'application copiée.");
      }
    } catch (err) { console.error(err); }
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setViewMode('reader');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
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
      
      {/* HEADER PROFESSIONNEL */}
      <header className="no-print sticky top-0 z-[100] bg-black border-b-2 border-white/5 backdrop-blur-3xl px-12 py-8 flex flex-col 3xl:flex-row items-center justify-between gap-12">
        <div className="flex flex-col xl:flex-row items-center gap-20">
          <GlitchLogo />
          <nav className="flex items-center gap-6 bg-white/[0.02] p-2 rounded-3xl border border-white/10">
            <NavButton 
              label="PRODUCTION" icon="✦" color="#00E5FF" 
              active={activeSection === 'storyboard' && viewMode === 'editor'} 
              onClick={() => {setViewMode('editor'); setActiveSection('storyboard');}} 
            />
            <NavButton 
              label="TERMINAL" icon="◈" color="#BF00FF" 
              active={activeSection === 'assets' && viewMode === 'editor'} 
              onClick={() => {setViewMode('editor'); setActiveSection('assets');}} 
            />
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setViewMode(viewMode === 'editor' ? 'reader' : 'editor')}
            className={`px-10 py-4 font-mono text-[12px] font-black tracking-[0.4em] rounded-xl border-2 transition-all ${viewMode === 'reader' ? 'bg-[#00FFA3] text-black border-transparent shadow-[6px_6px_0px_#000]' : 'text-white/40 border-white/10 hover:text-white hover:bg-white/5'}`}
          >
            {viewMode === 'editor' ? 'PREVIEW' : 'STUDIO'}
          </button>
          <button onClick={handlePublish} className="btn-glitch px-14 py-4 text-[15px] font-comic tracking-[0.3em]">PUBLIER</button>
        </div>
      </header>

      {/* OVERLAY CHARGEMENT */}
      {isPublishing && (
        <div className="fixed inset-0 z-[2000] bg-black flex flex-col items-center justify-center space-y-12">
           <div className="w-48 h-48 border-[15px] border-[#00E5FF] border-t-transparent animate-spin rounded-full shadow-[0_0_80px_#00E5FF]"></div>
           <h2 className="font-glitch text-7xl text-white tracking-[0.5em] animate-pulse uppercase">Compiling...</h2>
        </div>
      )}

      <main className="flex-grow p-8 md:p-20 relative z-10">
        
        {viewMode === 'editor' ? (
          <div className="max-w-[1700px] mx-auto space-y-32">
            
            {/* TERMINAL DE DÉPLOIEMENT & ASSETS */}
            {activeSection === 'assets' && (
              <div className="space-y-16">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                  {/* CONFIGURATION ASSETS */}
                  <div className="studio-panel p-16 rounded-[3rem] space-y-12 border-t-[8px] border-t-[#BF00FF]">
                    <h3 className="font-glitch text-5xl text-white uppercase tracking-widest">Core_Assets</h3>
                    <div className="grid grid-cols-3 gap-8">
                      {['seb', 'nadia', 'eevee'].map((k) => (
                        <div key={k} onClick={() => handleRefUpload(k as any)} className="flex flex-col items-center gap-6 cursor-pointer group">
                          <div className={`w-full aspect-square bg-white/5 rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${references[k as keyof ReferenceImages] ? 'border-solid border-[#BF00FF] shadow-lg' : 'border-white/10 group-hover:border-white/30'}`}>
                            {references[k as keyof ReferenceImages] ? <img src={references[k as keyof ReferenceImages]} className="w-full h-full object-cover" alt={k} /> : <span className="font-mono text-3xl opacity-20">+</span>}
                          </div>
                          <span className="font-mono text-[10px] opacity-40 uppercase tracking-widest font-black">{k}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-10 border-t border-white/5 space-y-6">
                      <button onClick={downloadProject} className="w-full py-6 bg-white/5 hover:bg-white/10 rounded-2xl border-2 border-white/10 font-mono text-xs font-black uppercase tracking-widest transition-all">Télécharger_Export_System (.json)</button>
                      <button onClick={() => {if(confirm("Wipe storage?")) {localStorage.clear(); location.reload();}}} className="w-full py-4 text-red-500/40 hover:text-red-500 font-mono text-[9px] uppercase tracking-[1em] transition-all">Reset_Local_Cache</button>
                    </div>
                  </div>

                  {/* DEPLOYMENT TERMINAL UI */}
                  <div className="studio-panel p-16 rounded-[3rem] space-y-10 border-t-[8px] border-t-[#00FFA3] bg-black/95 font-mono">
                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                       <h3 className="text-[#00FFA3] font-black uppercase tracking-widest">seuB.CA_Deployment_Console</h3>
                       <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500/40"></div>
                       </div>
                    </div>
                    <div className="space-y-6 text-[13px] text-white/70 overflow-x-auto">
                       <p className="text-[#00FFA3]">$ npm init @vitejs/app mission-glitch</p>
                       <p className="text-white/40"># Success: Project initialized</p>
                       <p className="text-[#00FFA3]">$ npm install @google/genai lucide-react</p>
                       <p className="text-white/40"># Success: Dependencies synced</p>
                       <div className="p-6 bg-white/5 rounded-xl border border-white/10 mt-10">
                          <p className="text-white font-bold mb-4 uppercase text-[#D1A110]">Mode d'emploi Ingénieur :</p>
                          <ol className="list-decimal list-inside space-y-3 opacity-80 leading-relaxed">
                            <li>Copie le contenu de <span className="text-[#00E5FF]">package.json</span> (fourni ci-contre) localement.</li>
                            <li>Lance <span className="bg-black px-2 py-1 rounded">npm install</span> dans ton dossier.</li>
                            <li>Configure ta <span className="text-[#BF00FF]">API_KEY</span> dans un fichier .env</li>
                            <li>Lance <span className="bg-black px-2 py-1 rounded">npm run dev</span> pour avoir l'app sur localhost.</li>
                            <li>Utilise <span className="text-[#00FFA3]">Vercel CLI</span> pour un déploiement URL immédiat.</li>
                          </ol>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STORYBOARD */}
            {activeSection === 'storyboard' && (
              <div className="space-y-48 pb-80">
                {comic.pages.map((page, pIdx) => (
                  <section key={pIdx} className="space-y-20 group/page">
                    <div className="flex items-center justify-between border-b-2 border-white/5 pb-10">
                      <div className="flex flex-col">
                         <span className="font-mono text-sm text-[#00E5FF] tracking-[0.5em] font-black mb-2 uppercase opacity-60">Sequence_0{pIdx + 1}</span>
                         <input 
                            value={page.title}
                            onChange={e => {
                              const p = [...comic.pages]; p[pIdx].title = e.target.value; setComic({...comic, pages: p});
                            }}
                            className="bg-transparent border-none font-comic text-7xl text-white outline-none uppercase tracking-tighter"
                         />
                      </div>
                      <button onClick={() => deletePage(pIdx)} className="text-red-500/30 hover:text-red-500 font-mono text-[10px] font-black uppercase tracking-widest border border-white/5 px-6 py-3 rounded-xl transition-all">Eject_Page</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 3xl:grid-cols-3 gap-20">
                      {page.panels.map(panel => (
                        <div key={panel.id} className="studio-panel flex flex-col rounded-[3rem] overflow-hidden group relative border-b-4 border-b-transparent hover:border-b-[#00E5FF]">
                          <div className="aspect-square bg-benday relative overflow-hidden bg-[#030305]">
                            {panel.imageUrl ? (
                              <img src={panel.imageUrl} className="w-full h-full object-cover transition-all group-hover:scale-110" alt="Frame" />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-[0.1]">
                                <span className="font-glitch text-[15rem] text-white">?</span>
                              </div>
                            )}

                            {panel.status === 'generating' && (
                              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
                                <div className="w-20 h-20 border-[10px] border-[#00E5FF] border-t-transparent animate-spin rounded-full"></div>
                                <span className="font-mono text-xs text-[#00E5FF] mt-8 animate-pulse font-black uppercase tracking-widest">Rendering...</span>
                              </div>
                            )}

                            <div className="absolute top-6 right-6 flex gap-4 opacity-0 group-hover:opacity-100 transition-all z-30">
                              <button onClick={() => handleManualUpload(panel.id)} className="p-4 bg-black/90 hover:bg-[#00E5FF] hover:text-black rounded-2xl border border-white/10">Upload</button>
                              <button onClick={() => deletePanel(panel.id)} className="p-4 bg-black/90 hover:bg-red-500 text-white rounded-2xl border border-white/10">Del</button>
                            </div>
                          </div>

                          <div className="p-10 space-y-8 bg-black/60">
                            <textarea 
                              value={panel.description}
                              onChange={(e: any) => updatePanel(panel.id, { description: e.target.value })}
                              className="w-full h-32 bg-white/[0.03] border-2 border-white/5 p-6 text-sm font-mono text-white placeholder:text-white/10 focus:border-[#00E5FF] outline-none resize-none rounded-2xl transition-all"
                              placeholder="Script de la scène..."
                            />
                            <button 
                              onClick={() => generateImage(panel.id)}
                              className="btn-glitch w-full py-5 text-sm font-comic tracking-widest"
                            >
                              GÉNÉRER_CADRE
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button 
                        onClick={() => addPanel(pIdx)}
                        className="aspect-square border-4 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center hover:border-[#00E5FF]/50 hover:bg-white/[0.02] transition-all group/add"
                      >
                        <span className="font-glitch text-9xl text-white/5 group-hover/add:text-[#00E5FF] transition-all">+</span>
                        <span className="font-mono text-[10px] text-white/20 uppercase tracking-widest font-black">Append_Panel</span>
                      </button>
                    </div>
                  </section>
                ))}
                
                <button 
                  onClick={addPage}
                  className="w-full py-20 border-4 border-dashed border-white/5 rounded-[4rem] font-glitch text-5xl text-white/5 hover:text-[#BF00FF] hover:border-[#BF00FF]/50 transition-all uppercase flex items-center justify-center gap-10"
                >
                  Insert_New_Sequence
                </button>
              </div>
            )}
          </div>
        ) : (
          /* READER */
          <div className="max-w-[1400px] mx-auto py-40 space-y-[40rem]">
            {comic.pages.map((page, idx) => (
              <div key={idx} className="space-y-40 px-12">
                <div className="flex flex-col items-center">
                  <h2 className="font-glitch text-8xl md:text-[14rem] text-white tracking-tighter text-center leading-none">{page.title}</h2>
                  <div className="w-80 h-2 bg-[#00E5FF] mt-10 shadow-[0_0_30px_#00E5FF]"></div>
                </div>
                
                <div className={`grid gap-20 ${page.panels.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {page.panels.map(p => (
                    <div key={p.id} className="relative group overflow-hidden bg-black border-[20px] border-black shadow-2xl hover:scale-[1.02] transition-all duration-700">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} className="w-full h-full object-cover" alt="Frame" />
                      ) : (
                        <div className="aspect-square flex items-center justify-center bg-[#010101] text-white/5 font-glitch text-9xl uppercase tracking-tighter">NULL</div>
                      )}
                      
                      <div className="absolute bottom-10 left-10 right-10 p-12 bg-white border-8 border-black text-black opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-20 group-hover:translate-y-0">
                         <p className="font-comic text-4xl md:text-5xl uppercase leading-none">{p.description}</p>
                         <div className="mt-6 font-mono text-[10px] font-black border-t-4 border-black/10 pt-4 flex justify-between uppercase tracking-widest">
                            <span>seuB.CA_PRO_2026</span>
                            <span>ID_{p.id.substring(0,6)}</span>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="text-center pt-80 pb-40 opacity-20">
              <span className="font-glitch text-[20vw] text-white tracking-[5vw]">FIN</span>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER HUD */}
      <footer className="no-print bg-black border-t-2 border-white/5 p-10 flex flex-col md:flex-row justify-between items-center px-16 z-[120]">
        <div className="flex items-center gap-12 font-mono text-[10px] tracking-widest uppercase opacity-60">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse shadow-[0_0_5px_#00E5FF]"></div>
             <span className="text-white font-black">Link_Stable</span>
          </div>
          <span>Latency_{networkPing}ms</span>
          <span>{comic.pages.flatMap(p => p.panels).length}_Assets</span>
        </div>
        
        <div className="flex items-center gap-8 mt-8 md:mt-0">
          <button onClick={handleShare} className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-xl border border-white/10 hover:bg-[#00E5FF] hover:text-black transition-all">
             <span className="font-mono text-[10px] font-black uppercase tracking-widest">Share_Link</span>
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </button>
          <div className="font-comic text-3xl text-white/20 uppercase tracking-[0.2em]">seuB.CA ©2026</div>
        </div>
      </footer>
    </div>
  );
}
