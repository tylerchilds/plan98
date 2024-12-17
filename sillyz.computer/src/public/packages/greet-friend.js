// https://chat.openai.com/c/cf45b001-fef7-452e-ac53-12e3f1695c31
import module from '../module.js'

// Define translations for time-of-day greetings in different languages
const timeOfDayGreetings = {
  en_US: {
    key: 'en_US',
    name: 'greet-friend',
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    flagEmoji: '🇺🇸', // U.S. flag emoji for English (U.S.)
  },
  en_CA: {
    key: 'en_CA',
    name: 'greet-friend',
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    flagEmoji: '🇨🇦', // Canadian flag emoji for English (Canada)
  },
  es_ES: {
    key: 'es_ES',
    name: 'saludo-amigo',
    morning: "Buenos días",
    afternoon: "Buenas tardes",
    evening: "Buenas noches",
    flagEmoji: '🇪🇸', // Spanish flag emoji for Spanish (Spain)
  },
  fr_FR: {
    key: 'fr_FR',
    name: 'salut-ami',
    morning: "Bonjour",
    afternoon: "Bonne après-midi",
    evening: "Bonsoir",
    flagEmoji: '🇫🇷', // French flag emoji for French (France)
  },
  en_GB: {
    key: 'en_GB',
    name: 'greet-friend',
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    flagEmoji: '🇬🇧', // British flag emoji for English (Great Britain)
  },
  es_MX: {
    key: 'es_MX',
    name: 'saludo-amigo',
    morning: "Buenos días",
    afternoon: "Buenas tardes",
    evening: "Buenas noches",
    flagEmoji: '🇲🇽', // Mexican flag emoji for Spanish (Mexico)
  },
  // Add more languages, translations, and flag emojis as needed
};

const translatedTags = [
  { locale: 'en_GB', name: 'greet-friend' },
  { locale: 'es_ES', name: 'saludo-amigo' },
  { locale: 'fr_FR', name: 'salut-ami' },
  // Add more tags as needed, each with its respective locale and name
];

function createGreetingTag(tagInfo) {
  const { name, locale } = tagInfo;

  const $ = module(name);

  customElements.define(name, class WebComponent extends HTMLElement {
    constructor() {
      super();
    }
  });

  $.draw((target) => {
    const friendName = target.getAttribute('x');
    const language = target.getAttribute('y') || locale;
    const now = new Date();
    const hour = now.getHours();

    const greeting = timeOfDayGreetings[language];
    const friendLanguage = timeOfDayGreetings[timeOfDayGreetings[language].key];

    // Find the correct time of day
    let timeOfDay;
    if (hour >= 5 && hour < 12) {
      timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 18) {
      timeOfDay = 'afternoon';
    } else {
      timeOfDay = 'evening';
    }

    const startAdornment = timeOfDayGreetings[locale].flagEmoji;
    const endAdornment = friendLanguage.flagEmoji;

    const message = greeting[timeOfDay];

    return `${startAdornment} ${message}, ${friendName} ${endAdornment}`;
  });

  $.style(`& { display: block }`)

  return $;
}

translatedTags.map(tagInfo => createGreetingTag(tagInfo));
