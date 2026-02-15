
import React, { useState } from 'react';
import { FileUp, Sparkles, X, Plus, Moon, Sun } from 'lucide-react';
import { FileAttachment, Language } from '../types';
import { useTranslation } from '../services/localization';

interface InitialScreenProps {
  onStart: (prompt: string, files: FileAttachment[]) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

const InitialScreen: React.FC<InitialScreenProps> = ({ onStart, language, setLanguage, theme, onThemeToggle }) => {
  const t = useTranslation(language);
  const [prompt, setPrompt] = useState('');
  const [files, setFiles] = useState<FileAttachment[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    uploadedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        const newFile: FileAttachment = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          data: base64,
          previewUrl: URL.createObjectURL(file)
        };
        setFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-black text-black dark:text-white relative transition-colors">
      <div className="absolute top-8 right-8 flex items-center gap-4">
        <button 
          onClick={onThemeToggle}
          className="p-2 border border-black dark:border-white transition-all"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <div className="w-full max-w-xl space-y-12 relative z-10">
        
        <div className="flex justify-center">
          <div className="inline-flex border border-black dark:border-white p-0.5">
            <button 
              onClick={() => setLanguage('en')}
              className={`px-4 py-1.5 text-[10px] font-black tracking-widest transition-all ${language === 'en' ? 'bg-black dark:bg-white text-white dark:text-black' : 'hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('ru')}
              className={`px-4 py-1.5 text-[10px] font-black tracking-widest transition-all ${language === 'ru' ? 'bg-black dark:bg-white text-white dark:text-black' : 'hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black'}`}
            >
              RU
            </button>
          </div>
        </div>

        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-black dark:bg-white flex items-center justify-center mx-auto transition-transform hover:scale-110 duration-500">
            <Sparkles className="text-white dark:text-black" size={32} />
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase italic">Lumina</h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed text-black/60 dark:text-white/60">
            {t('tagline')}
          </p>
        </div>

        <div className="border border-black dark:border-white p-8 space-y-8 bg-white dark:bg-black">
          <textarea
            autoFocus
            className="w-full text-2xl p-0 bg-transparent border-none focus:ring-0 min-h-[140px] resize-none serif placeholder:text-black/10 dark:placeholder:text-white/10 text-black dark:text-white font-bold"
            placeholder={t('placeholder')}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/60 dark:text-white/60">{t('attachments')}</h3>
              <label className="cursor-pointer group flex items-center gap-2 text-[10px] font-black hover:underline uppercase tracking-widest">
                <Plus size={12} /> {t('addFiles')}
                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            {files.length === 0 ? (
              <div className="border border-dashed border-black/20 dark:border-white/20 p-8 text-center bg-black/[0.01] dark:bg-white/[0.01]">
                <FileUp className="mx-auto mb-2 opacity-20" size={24} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">{t('optionalFiles')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {files.map(file => (
                  <div key={file.id} className="border border-black dark:border-white p-2 flex items-center gap-3">
                    <div className="w-8 h-8 bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shrink-0">
                      {file.type.startsWith('image') ? <img src={file.previewUrl} className="w-full h-full object-cover" /> : <FileUp size={12} />}
                    </div>
                    <span className="text-[8px] font-black truncate flex-1 uppercase tracking-widest">{file.name}</span>
                    <button onClick={() => removeFile(file.id)} className="hover:text-red-500 transition-colors">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            disabled={!prompt.trim()}
            onClick={() => onStart(prompt, files)}
            className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-[0.3em] border border-black dark:border-white transition-all active:scale-[0.98] hover:bg-white dark:hover:bg-black hover:text-black dark:hover:text-white"
          >
            {t('initialize')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitialScreen;
