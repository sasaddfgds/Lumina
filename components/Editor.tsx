
import React, { useRef, useState, useEffect } from 'react';
import FloatingMenu from './FloatingMenu';
import { AIActionType, Suggestion, Language, ViewStyle } from '../types';
import { performInlineAction, getProactiveSuggestions } from '../services/gemini';
import { Sparkles, Check, X, Loader2 } from 'lucide-react';
import { useTranslation } from '../services/localization';

interface EditorProps {
  content: string;
  setContent: (val: string) => void;
  suggestions: Suggestion[];
  setSuggestions: (s: Suggestion[]) => void;
  language: Language;
  viewStyle: ViewStyle;
  onInteraction: (isTyping: boolean) => void;
}

const Editor: React.FC<EditorProps> = ({ 
  content, 
  setContent, 
  suggestions, 
  setSuggestions, 
  language, 
  viewStyle,
  onInteraction 
}) => {
  const t = useTranslation(language);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedRange, setSelectedRange] = useState({ start: 0, end: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = useRef<number | null>(null);

  const handleSelection = () => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;

    if (start !== end) {
      const { top, left } = getSelectionCoords(el);
      setMenuPos({ top, left });
      setIsMenuVisible(true);
      setSelectedRange({ start, end });
    } else {
      setIsMenuVisible(false);
    }
  };

  const handleTyping = () => {
    setIsTyping(true);
    onInteraction(true);
    if (typingTimeout.current) window.clearTimeout(typingTimeout.current);
    typingTimeout.current = window.setTimeout(() => {
      setIsTyping(false);
      onInteraction(false);
    }, 2000);
  };

  const getSelectionCoords = (el: HTMLTextAreaElement) => {
    const rect = el.getBoundingClientRect();
    return { top: rect.top, left: rect.left + el.clientWidth / 2 - 150 };
  };

  const onAIAction = async (action: AIActionType, custom?: string) => {
    setIsProcessing(true);
    setIsMenuVisible(false);
    const selectedText = content.substring(selectedRange.start, selectedRange.end);
    
    try {
      const improvedText = await performInlineAction(action, selectedText, content, custom);
      const newContent = 
        content.substring(0, selectedRange.start) + 
        improvedText + 
        content.substring(selectedRange.end);
      
      setContent(newContent);
    } catch (error) {
      console.error("AI Action failed", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const applySuggestion = (s: Suggestion) => {
    const newContent = content.replace(s.originalText, s.suggestedText);
    setContent(newContent);
    setSuggestions(suggestions.filter(item => item.id !== s.id));
  };

  const dismissSuggestion = (id: string) => {
    setSuggestions(suggestions.filter(item => item.id !== id));
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (content.length > 50 && suggestions.length === 0) {
        const newSuggestions = await getProactiveSuggestions(content, language);
        setSuggestions(newSuggestions);
      }
    }, 12000);
    return () => clearTimeout(timer);
  }, [content, suggestions.length, setSuggestions, language]);

  // Style class logic
  const getEditorClasses = () => {
    const base = "w-full min-h-[75vh] leading-[1.8] text-black dark:text-white bg-transparent border-none focus:ring-0 resize-none placeholder:text-black/10 dark:placeholder:text-white/10 transition-all duration-300 ";
    switch (viewStyle) {
      case 'typewriter':
        return base + "mono text-lg md:text-xl selection:bg-black/80";
      case 'swiss':
        return base + "font-black text-2xl md:text-3xl tracking-tighter uppercase selection:bg-black dark:selection:bg-white";
      case 'modern':
      default:
        return base + "serif text-xl md:text-3xl selection:bg-black/90";
    }
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto min-h-[60vh] py-8 px-6 lg:px-12 transition-all duration-500 ${viewStyle === 'swiss' ? 'border-x border-black dark:border-white' : ''}`}>
      <FloatingMenu 
        isVisible={isMenuVisible} 
        position={menuPos} 
        onAction={onAIAction} 
        language={language}
      />

      {isProcessing && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-black dark:bg-white text-white dark:text-black px-6 py-3 border border-black dark:border-white shadow-none flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-150">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('thinking')}</span>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => { setContent(e.target.value); handleTyping(); }}
        onMouseUp={handleSelection}
        onKeyUp={(e) => { handleSelection(); handleTyping(); }}
        placeholder={t('editorPlaceholder')}
        className={getEditorClasses()}
      />

      {/* Proactive Suggestions - Higher Contrast */}
      <div className={`fixed right-10 top-32 w-64 space-y-8 hidden xl:block transition-all duration-500 ${isTyping ? 'opacity-10 translate-x-4' : 'opacity-100'}`}>
        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/60 dark:text-white/60 flex items-center gap-3">
          <div className="w-2 h-2 bg-black dark:bg-white"></div>
          {t('proactiveIdeas')}
        </h3>
        {suggestions.length === 0 ? (
          <p className="text-[10px] text-black/30 dark:text-white/30 font-black uppercase tracking-widest italic">{t('keepWriting')}</p>
        ) : (
          suggestions.map((s) => (
            <div key={s.id} className="border border-black dark:border-white p-5 space-y-4 hover:bg-black/5 dark:hover:bg-white/5 transition-all group bg-white dark:bg-black">
              <p className="text-[8px] font-black text-black/60 dark:text-white/60 uppercase tracking-widest">{s.reason}</p>
              <div className="space-y-2">
                <div className="text-[10px] text-black/30 dark:text-white/30 line-through font-bold">{s.originalText}</div>
                <div className="text-sm text-black dark:text-white font-black italic tracking-tight leading-relaxed">{s.suggestedText}</div>
              </div>
              <div className="flex items-center gap-1 pt-4 border-t border-black dark:border-white opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => applySuggestion(s)}
                  className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-black dark:border-white transition-all"
                >
                  <Check size={12} /> {t('apply')}
                </button>
                <button 
                  onClick={() => dismissSuggestion(s.id)}
                  className="p-2 border border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Editor;
