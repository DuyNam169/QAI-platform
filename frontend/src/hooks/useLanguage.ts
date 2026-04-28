import { useState, useCallback } from 'react';
import type { Lang } from '../i18n/translations';

const STORAGE_KEY = 'app_language';

function getInitialLang(): Lang {
  const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
  if (saved === 'vi' || saved === 'en') return saved;
  const browser = navigator.language.toLowerCase();
  return browser.startsWith('vi') ? 'vi' : 'en';
}

export function useLanguage() {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = useCallback((next: Lang) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLangState(next);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'vi' ? 'en' : 'vi');
  }, [lang, setLang]);

  return { lang, setLang, toggleLang };
}