import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import gu from '../locales/gu.json';

export const initializeI18n = () => {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      gu: { translation: gu }
    },
    lng: localStorage.getItem('language') || 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });
};