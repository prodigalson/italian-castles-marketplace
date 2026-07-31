export const CITIES = {
    milan: {
        label: { en: 'Milan', it: 'Milano', pt: 'Milao', fr: 'Milan' },
        short: { en: 'MILAN', it: 'MILANO', pt: 'MILAO', fr: 'MILAN' },
        coverImage: 'https://images.unsplash.com/photo-1520440229-6469a149ac59?w=2000&q=80&fit=crop',
        coverAlt: { en: 'Milan at dusk', it: 'Milano al tramonto', pt: 'Milao ao entardecer', fr: 'Milan au crepuscule' },
        flag: '\uD83C\uDDEE\uD83C\uDDF9',
    },
    rio: {
        label: { en: 'Rio de Janeiro', it: 'Rio de Janeiro', pt: 'Rio de Janeiro', fr: 'Rio de Janeiro' },
        short: { en: 'RIO', it: 'RIO', pt: 'RIO', fr: 'RIO' },
        coverImage: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=2000&q=80&fit=crop',
        coverAlt: { en: 'Rio de Janeiro at dusk', it: 'Rio de Janeiro al tramonto', pt: 'Rio de Janeiro ao entardecer', fr: 'Rio de Janeiro au crepuscule' },
        flag: '\uD83C\uDDE7\uD83C\uDDF7',
    },
    paris: {
        label: { en: 'Paris', it: 'Parigi', pt: 'Paris', fr: 'Paris' },
        short: { en: 'PARIS', it: 'PARIGI', pt: 'PARIS', fr: 'PARIS' },
        coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=2000&q=80&fit=crop',
        coverAlt: { en: 'Paris at dusk', it: 'Parigi al tramonto', pt: 'Paris ao entardecer', fr: 'Paris au crepuscule' },
        flag: '\uD83C\uDDEB\uD83C\uDDF7',
    },
    tokyo: {
        label: { en: 'Tokyo', it: 'Tokyo', pt: 'Toquio', fr: 'Tokyo' },
        short: { en: 'TOKYO', it: 'TOKYO', pt: 'TOQUIO', fr: 'TOKYO' },
        coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=2000&q=80&fit=crop',
        coverAlt: { en: 'Shinjuku at night', it: 'Shinjuku di notte', pt: 'Shinjuku a noite', fr: 'Shinjuku la nuit' },
        flag: '\uD83C\uDDEF\uD83C\uDDF5',
    },
};

export const DEFAULT_CITY = 'milan';

export const translations = {
    coverTagline: { en: "Where shall we go\non our next date?", it: "Dove andiamo\nal prossimo appuntamento?", pt: "Pra onde a gente vai\nno proximo date?", fr: "Ou est-ce qu'on va\npour notre prochain rendez-vous ?" },
    coverDesc: { en: "Curated date spots in {city},\nfor every kind of night out.", it: "Luoghi curati per appuntamenti a {city},\nper ogni tipo di serata.", pt: "Lugares selecionados para encontros em {city},\npara todo tipo de noitada.", fr: "Adresses choisies pour vos rendez-vous a {city},\npour toutes les soirees." },
    openMagazine: { en: "Enter", it: "Entra", pt: "Entrar", fr: "Entrer" },
    enter: { en: "Enter", it: "Entra", pt: "Entrar", fr: "Entrer" },
    folioDate: { en: "Date", it: "Appuntamento", pt: "Encontro", fr: "Rendez-vous" },
    folioOf: { en: "of", it: "di", pt: "de", fr: "sur" },
    folioCurated: { en: "{city} Date Spots", it: "Appuntamenti a {city}", pt: "Encontros no {city}", fr: "Rendez-vous a {city}" },
    neighborhood: { en: "Neighborhood", it: "Quartiere", pt: "Bairro", fr: "Quartier" },
    dateType: { en: "Date Type", it: "Tipo di Serata", pt: "Tipo de Encontro", fr: "Type de rendez-vous" },
    priceRange: { en: "Price", it: "Prezzo", pt: "Preco", fr: "Prix" },
    vibe: { en: "Vibe", it: "Atmosfera", pt: "Clima", fr: "Ambiance" },
    openInMaps: { en: "Open in Google Maps", it: "Apri in Google Maps", pt: "Abrir no Google Maps", fr: "Ouvrir dans Google Maps" },
    footerText: { en: "{cityShort} / AMO DOVE ANDIAMO", it: "{cityShort} / AMO DOVE ANDIAMO", pt: "{cityShort} / AMO DOVE ANDIAMO", fr: "{cityShort} / AMO DOVE ANDIAMO" },
    kbHint: { en: "Use arrow keys or scroll to navigate", it: "Usa le frecce o scrolla per navigare", pt: "Use as setas ou role para navegar", fr: "Utilisez les fleches ou faites defiler pour naviguer" },
    swipeHint: { en: "Swipe to explore", it: "Scorri per esplorare", pt: "Deslize para explorar", fr: "Glissez pour explorer" },
    issueNo: { en: "Issue No. 01", it: "Numero 01", pt: "Edicao 01", fr: "Numero 01" },
    season: { en: "Spring 2026", it: "Primavera 2026", pt: "Outono 2026", fr: "Printemps 2026" },
    shareLocation: { en: "Share this spot", it: "Condividi questo luogo", pt: "Compartilhar este lugar", fr: "Partager ce lieu" },
    copied: { en: "Link copied!", it: "Link copiato!", pt: "Link copiado!", fr: "Lien copie !" },
    filterTitle: { en: "Filter Spots", it: "Filtra i Luoghi", pt: "Filtrar Lugares", fr: "Filtrer les lieux" },
    cityLabel: { en: "City", it: "Citta", pt: "Cidade", fr: "Ville" },
    type: { en: "Date Type", it: "Tipo", pt: "Tipo", fr: "Type" },
    any: { en: "Any", it: "Tutti", pt: "Todos", fr: "Tous" },
    "romantic-dinner": { en: "Romantic Dinner", it: "Cena Romantica", pt: "Jantar Romantico", fr: "Diner Romantique" },
    "casual-lunch": { en: "Casual Lunch", it: "Pranzo Informale", pt: "Almoco Descontraido", fr: "Dejeuner Decontracte" },
    "cocktail-bar": { en: "Cocktail Bar", it: "Cocktail Bar", pt: "Bar de Drinks", fr: "Bar a Cocktails" },
    aperitivo: { en: "Aperitivo", it: "Aperitivo", pt: "Happy Hour", fr: "Aperitif" },
    "coffee-pastry": { en: "Coffee & Pastry", it: "Caffe & Pasticceria", pt: "Cafe & Doces", fr: "Cafe & Patisserie" },
    cultural: { en: "Cultural", it: "Cultura", pt: "Cultural", fr: "Culturel" },
    outdoor: { en: "Outdoor", it: "Aperto", pt: "Ao Ar Livre", fr: "Plein Air" },
    "live-music": { en: "Live Music", it: "Musica dal Vivo", pt: "Musica ao Vivo", fr: "Musique Live" },
    workout: { en: "Workout", it: "Sport", pt: "Academia", fr: "Sport" },
    vibeFilter: { en: "Vibe", it: "Atmosfera", pt: "Clima", fr: "Ambiance" },
    romantic: { en: "Romantic", it: "Romantico", pt: "Romantico", fr: "Romantique" },
    casual: { en: "Casual", it: "Informale", pt: "Descontraido", fr: "Decontracte" },
    festive: { en: "Festive", it: "Festoso", pt: "Festivo", fr: "Festif" },
    classic: { en: "Classic", it: "Classico", pt: "Classico", fr: "Classique" },
    priceFilter: { en: "Price", it: "Prezzo", pt: "Preco", fr: "Prix" },
    horoscope: { en: "Horoscope", it: "Oroscopo", pt: "Horoscopo", fr: "Horoscope" },
    aries: { en: "\u2648 Aries", it: "\u2648 Ariete", pt: "\u2648 Aries", fr: "\u2648 Belier" },
    taurus: { en: "\u2649 Taurus", it: "\u2649 Toro", pt: "\u2649 Touro", fr: "\u2649 Taureau" },
    gemini: { en: "\u264A Gemini", it: "\u264A Gemelli", pt: "\u264A Gemeos", fr: "\u264A Gemeaux" },
    cancer: { en: "\u264B Cancer", it: "\u264B Cancro", pt: "\u264B Cancer", fr: "\u264B Cancer" },
    leo: { en: "\u264C Leo", it: "\u264C Leone", pt: "\u264C Leao", fr: "\u264C Lion" },
    virgo: { en: "\u264D Virgo", it: "\u264D Vergine", pt: "\u264D Virgem", fr: "\u264D Vierge" },
    libra: { en: "\u264E Libra", it: "\u264E Bilancia", pt: "\u264E Libra", fr: "\u264E Balance" },
    scorpio: { en: "\u264F Scorpio", it: "\u264F Scorpione", pt: "\u264F Escorpiao", fr: "\u264F Scorpion" },
    sagittarius: { en: "\u2650 Sagittarius", it: "\u2650 Sagittario", pt: "\u2650 Sagitario", fr: "\u2650 Sagittaire" },
    capricorn: { en: "\u2651 Capricorn", it: "\u2651 Capricorno", pt: "\u2651 Capricornio", fr: "\u2651 Capricorne" },
    aquarius: { en: "\u2652 Aquarius", it: "\u2652 Acquario", pt: "\u2652 Aquario", fr: "\u2652 Verseau" },
    pisces: { en: "\u2653 Pisces", it: "\u2653 Pesci", pt: "\u2653 Peixes", fr: "\u2653 Poissons" },
    reset: { en: "Reset Filters", it: "Resetta Filtri", pt: "Limpar Filtros", fr: "Reinitialiser" },
    noResults: { en: "No spots match your filters.", it: "Nessun luogo corrisponde ai filtri.", pt: "Nenhum lugar corresponde aos filtros.", fr: "Aucun lieu ne correspond a vos filtres." },
};

let currentLang = localStorage.getItem('amoLang') || 'en';
let currentCity = localStorage.getItem('amoCity') || DEFAULT_CITY;
if (!CITIES[currentCity]) currentCity = DEFAULT_CITY;

function interpolate(str, vars) {
    return str.replace(/\{(\w+)\}/g, (_, k) => (vars && vars[k] != null ? vars[k] : ''));
}

export function t(key, vars) {
    const entry = translations[key];
    if (!entry) return key;
    const raw = entry[currentLang] || entry.en || key;
    const city = CITIES[currentCity] || CITIES[DEFAULT_CITY];
    const base = {
        city: city.label[currentLang] || city.label.en,
        cityShort: city.short[currentLang] || city.short.en,
    };
    return interpolate(raw, { ...base, ...(vars || {}) });
}

export function getLang() { return currentLang; }

export function getCity() { return currentCity; }

export function setCity(city) {
    if (!CITIES[city]) return;
    currentCity = city;
    localStorage.setItem('amoCity', city);
    applyTranslations();
}

export function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('amoLang', lang);
    document.documentElement.lang = ['it', 'pt', 'fr'].includes(lang) ? lang : 'en';
    applyTranslations();
}

export function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        const text = t(key);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = text;
        } else {
            el.innerHTML = text.replace(/\n/g, '<br>');
        }
    });
}
