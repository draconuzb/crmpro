import { uz } from './uz';
import { ru } from './ru';

const languages = { uz, ru };

export type Lang = keyof typeof languages;

export function t(lang: Lang = 'uz') {
  return languages[lang] || languages.uz;
}
