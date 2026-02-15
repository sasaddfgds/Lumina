
import React, { useState, useEffect } from 'react';
import { Sparkles, Save, Share2, History, Sidebar as SidebarIcon, Github, Plus, FileText, X, Moon, Sun, Monitor } from 'lucide-react';
import InitialScreen from './components/InitialScreen';
import Editor from './components/Editor';
import { FileAttachment, Suggestion, Language, ViewStyle } from './types';
import { generateInitialDraft } from './services/gemini';
import { useTranslation } from './services/localization';

interface Document {
  id: string;
  title: string;
  content: string;
}

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [viewStyle, setViewStyle] = useState<ViewStyle>('modern');
  const [isZenMode, setIsZenMode] = useState(false);
  const t = useTranslation(language);
  const [hasStarted, setHasStarted] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const activeDoc = documents.find(d => d.id === activeDocId);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const setContent = (newContent: string) => {
    if (!activeDocId) return;
    setDocuments(docs => docs.map(d => d.id === activeDocId ? { ...d, content: newContent } : d));
  };

  const setTitle = (newTitle: string) => {
    if (!activeDocId) return;
    setDocuments(docs => docs.map(d => d.id === activeDocId ? { ...d, title: newTitle } : d));
  };

  const startProject = async (prompt: string, files: FileAttachment[]) => {
    setHasStarted(true);
    setIsLoading(true);
    setAttachments(files);
    
    try {
      const draft = await generateInitialDraft(prompt, files, language);
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        title: draft.split('\n')[0].replace(/#|[*]/g, '').trim().substring(0, 30) || 'Lumina Draft',
        content: draft
      };
      setDocuments([newDoc]);
      setActiveDocId(newDoc.id);
    } catch (e) {
      console.error("Failed to start project", e);
      const errorDoc: Document = {
        id: 'error',
        title: 'Error Draft',
        content: language === 'ru' 
          ? "Произошла ошибка при создании черновика. Пожалуйста, начните писать ниже или попросите меня изменить конкретный запрос."
          : "I encountered an issue generating your draft. Please try writing below or ask me to rewrite a specific prompt."
      };
      setDocuments([errorDoc]);
      setActiveDocId('error');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewDoc = () => {
    const newDoc: Document = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Document',
      content: ''
    };
    setDocuments([...documents, newDoc]);
    setActiveDocId(newDoc.id);
  };

  const closeDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newDocs = documents.filter(d => d.id !== id);
    setDocuments(newDocs);
    if (activeDocId === id) {
      setActiveDocId(newDocs.length > 0 ? newDocs[0].id : null);
      if (newDocs.length === 0) setHasStarted(false);
    }
  };

  if (!hasStarted) {
    return <InitialScreen onStart={startProject} language={language} setLanguage={setLanguage} theme={theme} onThemeToggle={toggleTheme} />;
  }

  return (
    <div className={`flex flex-col min-h-screen bg-white dark:bg-black text-black dark:text-white transition-all duration-700 ${isZenMode ? 'cursor-text' : ''}`}>
      {/* Navigation */}
      <nav className={`sticky top-0 z-40 bg-white dark:bg-black border-b border-black dark:border-white px-6 py-2 flex items-center justify-between transition-opacity duration-500 ${isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex items-center gap-6">
          <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center cursor-pointer transition-transform hover:scale-105" onClick={() => setHasStarted(false)}>
            <Sparkles className="text-white dark:text-black" size={16} />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {documents.map(doc => (
              <div 
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`group flex items-center gap-2 px-3 py-1.5 border border-black dark:border-white text-[10px] font-black uppercase tracking-widest cursor-pointer transition-colors ${activeDocId === doc.id ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-black text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <FileText size={12} />
                <span className="max-w-[100px] truncate">{doc.title}</span>
                <X size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => closeDoc(doc.id, e)} />
              </div>
            ))}
            <button 
              onClick={createNewDoc}
              className="p-1.5 border border-dashed border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Style Selector Innovation */}
          <div className="flex items-center border border-black dark:border-white divide-x divide-black dark:divide-white">
            {(['modern', 'typewriter', 'swiss'] as ViewStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setViewStyle(style)}
                className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${viewStyle === style ? 'bg-black dark:bg-white text-white dark:text-black' : 'hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black'}`}
              >
                {t(style as any)}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center border border-black dark:border-white">
            <button 
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 text-[10px] font-black transition-all ${language === 'en' ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-black dark:text-white'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('ru')}
              className={`px-3 py-1.5 text-[10px] font-black transition-all ${language === 'ru' ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-black dark:text-white'}`}
            >
              RU
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2 border border-transparent hover:border-black dark:hover:border-white transition-all">
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-black dark:border-white font-black text-[10px] uppercase tracking-widest hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all">
              <Share2 size={12} /> {t('share')}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-black text-[10px] uppercase tracking-widest border border-black dark:border-white transition-all">
              <Save size={12} /> {t('save')}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        <aside className={`w-14 border-r border-black dark:border-white flex flex-col items-center py-8 gap-8 hidden md:flex shrink-0 transition-opacity duration-500 ${isZenMode ? 'opacity-0' : 'opacity-100'}`}>
          <button className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"><SidebarIcon size={18} /></button>
          <div className="w-6 h-[1px] bg-black/20 dark:bg-white/20" />
          <button className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"><Github size={18} /></button>
        </aside>

        <div className="flex-1 overflow-y-auto bg-white dark:bg-black selection:bg-black dark:selection:bg-white selection:text-white dark:selection:text-black transition-colors no-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-8 p-12">
              <div className="w-20 h-20 border-2 border-black dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-black uppercase tracking-[0.2em]">{t('crafting')}</h2>
                <p className="text-black/60 dark:text-white/60 text-xs font-bold uppercase tracking-widest">{t('craftingSub')}</p>
              </div>
            </div>
          ) : activeDoc ? (
            <div className="relative">
              {/* Semantic Aura Innovation - Sublte pulse when AI is ready */}
              {suggestions.length > 0 && (
                <div className="fixed inset-0 pointer-events-none transition-opacity duration-1000 opacity-20">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] border border-black/10 dark:border-white/10 rounded-full animate-pulse"></div>
                </div>
              )}
              
              <div className={`max-w-4xl mx-auto px-12 pt-12 transition-opacity duration-500 ${isZenMode ? 'opacity-0' : 'opacity-100'}`}>
                <input 
                  type="text"
                  className="w-full text-[10px] font-black uppercase tracking-[0.5em] text-black/40 dark:text-white/40 border-none focus:ring-0 p-0 mb-4 bg-transparent"
                  value={activeDoc.title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="DOCUMENT TITLE"
                />
              </div>
              <Editor 
                content={activeDoc.content} 
                setContent={setContent} 
                suggestions={suggestions}
                setSuggestions={setSuggestions}
                language={language}
                viewStyle={viewStyle}
                onInteraction={(typing) => setIsZenMode(typing)}
              />
            </div>
          ) : null}
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t border-black dark:border-white px-8 py-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.25em] text-black/60 dark:text-white/60 transition-all duration-500 ${isZenMode ? 'opacity-0 translate-y-full' : 'opacity-100'}`}>
        <div className="flex items-center gap-8">
          <span>{t('words')}: {activeDoc?.content.split(/\s+/).filter(x => x).length || 0}</span>
          <span>{t('chars')}: {activeDoc?.content.length || 0}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-black dark:bg-white animate-pulse"></div>
            {t('active')}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
