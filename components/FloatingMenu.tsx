
import React, { useState } from 'react';
import { Sparkles, Scissors, Plus, CheckCircle, MessageSquare, Languages, ChevronLeft } from 'lucide-react';
import { AIActionType, Language } from '../types';
import { useTranslation } from '../services/localization';

interface FloatingMenuProps {
  position: { top: number; left: number };
  onAction: (action: AIActionType, custom?: string) => void;
  isVisible: boolean;
  language: Language;
}

const FloatingMenu: React.FC<FloatingMenuProps> = ({ position, onAction, isVisible, language }) => {
  const t = useTranslation(language);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showTranslateOptions, setShowTranslateOptions] = useState(false);
  const [customInput, setCustomInput] = useState('');

  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-50 bg-white dark:bg-black shadow-none border border-black dark:border-white p-0.5 flex flex-col gap-0.5 transition-all animate-in fade-in zoom-in duration-150"
      style={{ top: position.top - 60, left: position.left }}
    >
      {!showCustomInput && !showTranslateOptions ? (
        <div className="flex items-center gap-0.5">
          <MenuButton icon={<Sparkles size={14} />} label={t('rewrite')} onClick={() => onAction(AIActionType.REWRITE)} />
          <MenuButton icon={<Scissors size={14} />} label={t('shorten')} onClick={() => onAction(AIActionType.SHORTEN)} />
          <MenuButton icon={<Plus size={14} />} label={t('expand')} onClick={() => onAction(AIActionType.EXPAND)} />
          <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-1" />
          <MenuButton icon={<Languages size={14} />} label={t('translate')} onClick={() => setShowTranslateOptions(true)} />
          <MenuButton icon={<MessageSquare size={14} />} label={t('ask')} onClick={() => setShowCustomInput(true)} />
        </div>
      ) : showTranslateOptions ? (
        <div className="flex items-center gap-0.5 p-0.5">
          <MenuButton icon={<span className="text-[8px] font-black">EN</span>} label={t('toEnglish')} onClick={() => onAction(AIActionType.TRANSLATE_EN)} />
          <MenuButton icon={<span className="text-[8px] font-black">RU</span>} label={t('toRussian')} onClick={() => onAction(AIActionType.TRANSLATE_RU)} />
          <div className="w-[1px] h-4 bg-black/10 dark:bg-white/10 mx-1" />
          <button 
            onClick={() => setShowTranslateOptions(false)}
            className="flex items-center gap-2 px-3 py-2 text-[10px] font-black text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all uppercase tracking-widest"
          >
            <ChevronLeft size={12} /> {t('back')}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1 p-1 w-64 bg-white dark:bg-black">
          <input 
            autoFocus
            type="text"
            className="flex-1 text-[10px] bg-transparent text-black dark:text-white border-none focus:ring-0 p-1.5 font-bold uppercase tracking-widest"
            placeholder={t('customPlaceholder')}
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onAction(AIActionType.CUSTOM, customInput);
              if (e.key === 'Escape') setShowCustomInput(false);
            }}
          />
          <button 
            onClick={() => onAction(AIActionType.CUSTOM, customInput)}
            className="p-1.5 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all border border-transparent hover:border-black dark:hover:border-white"
          >
            <CheckCircle size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

const MenuButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-2 px-3 py-2 text-[10px] text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all font-black uppercase tracking-widest whitespace-nowrap"
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default FloatingMenu;
