import React from 'react';
import { Language } from '../types';
import { Languages, Globe } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
  ];

  return (
    <div className="flex items-center space-x-2 bg-slate-900/60 p-1.5 rounded-lg border border-slate-800/80">
      <div className="flex items-center space-x-1 sm:space-x-1.5">
        <Globe className="w-3.5 h-3.5 text-slate-400" id="lang-selector-globe" />
        {languages.map((lang) => {
          const isActive = currentLanguage === lang.code;
          return (
            <button
              key={lang.code}
              id={`lang-btn-${lang.code}`}
              onClick={() => onLanguageChange(lang.code)}
              className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>{lang.flag}</span>
              <span className="uppercase">{lang.code}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
