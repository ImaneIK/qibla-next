import { Globe } from 'lucide-react';
import { Language } from '../hooks/useLanguage';

interface LanguageSwitcherProps {
  current: Language;
  onChange: (lang: Language) => void;
}

const langs: { value: Language; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'fr', label: 'FR' },
  { value: 'ar', label: 'عر' },
];

const LanguageSwitcher = ({ current, onChange }: LanguageSwitcherProps) => {
  return (
    <div className="flex items-center gap-1 glass rounded-full px-1 py-1">
      {langs.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
            current === value
              ? 'gold-gradient text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
