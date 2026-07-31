// Maps every spot to a real neighborhood name based on coordinates.
// Run: node scripts/fix-neighborhoods.js
const fs = require('fs');
const path = require('path');

const SPOTS_PATH = path.join(__dirname, '..', 'data', 'spots.json');
const spots = JSON.parse(fs.readFileSync(SPOTS_PATH, 'utf8'));

// Per-spot overrides (id → { en, it } neighborhood name only — city suffix added later)
const overrides = {
  // ===== Milan =====
  'bar-basso':                    { en: 'Porta Venezia',          it: 'Porta Venezia' },
  'trippa':                       { en: 'Porta Romana',           it: 'Porta Romana' },
  'parco-sempione':               { en: 'Sempione',               it: 'Sempione' },
  'dry-milano':                   { en: 'Brera',                  it: 'Brera' },
  'bulgari-garden':               { en: 'Brera',                  it: 'Brera' },
  'eutopia':                      { en: 'Garibaldi',              it: 'Garibaldi' },
  'osteria-afrodite':             { en: 'NoLo',                   it: 'NoLo' },
  'il-baretto':                   { en: 'San Babila',             it: 'San Babila' },
  'waby':                         { en: 'Garibaldi',              it: 'Garibaldi' },
  'taverna-trastevere':           { en: 'Brera',                  it: 'Brera' },
  'l-ile-douce':                  { en: 'Isola',                  it: 'Isola' },
  'veramente':                    { en: 'Brera',                  it: 'Brera' },
  'roppongi':                     { en: 'Porta Nuova',            it: 'Porta Nuova' },
  'bar-nico':                     { en: 'Citta Studi',            it: 'Citta Studi' },
  'sakeya':                       { en: 'Solari',                 it: 'Solari' },
  'atypique':                     { en: 'Brera',                  it: 'Brera' },
  'bolo-bolo-bar':                { en: 'Paolo Sarpi',             it: 'Paolo Sarpi' },
  'onda-listening-bar':           { en: 'Cinque Giornate',        it: 'Cinque Giornate' },
  'frida':                        { en: 'Isola',                  it: 'Isola' },
  'isola-rooftop':                { en: 'Cordusio',               it: 'Cordusio' },
  'salmon-guru':                  { en: 'CityLife',               it: 'CityLife' },
  'baunilla-bosco-verticale':     { en: 'Porta Nuova',            it: 'Porta Nuova' },
  'barragan':                     { en: 'Tortona',                it: 'Tortona' },
  'kagurazaka-saryo':             { en: 'Garibaldi',              it: 'Garibaldi' },
  'bicchierino':                  { en: 'Lorenteggio',            it: 'Lorenteggio' },
  'gallerie-d-italia':            { en: 'Duomo',                  it: 'Duomo' },
  'palazzo-cordusio':             { en: 'Cordusio',               it: 'Cordusio' },
  'al-cortile':                   { en: 'Navigli',                it: 'Navigli' },
  'pasticceria-clivati':          { en: 'Solari',                 it: 'Solari' },
  'rumore':                       { en: 'San Babila',             it: 'San Babila' },
  'ronin':                        { en: 'Sempione',               it: 'Sempione' },
  'osaka':                        { en: 'Brera',                  it: 'Brera' },
  'miyabi':                       { en: 'San Babila',             it: 'San Babila' },
  'locanda-perbellini':           { en: 'Brera',                  it: 'Brera' },
  'al-baretto-san-marco':         { en: 'Brera',                  it: 'Brera' },
  'osteria-la-carbonaia':         { en: "Sant'Ambrogio",          it: "Sant'Ambrogio" },
  'sogni':                        { en: 'Navigli',                it: 'Navigli' },
  'beefbar':                      { en: 'San Babila',             it: 'San Babila' },
  'moebius':                      { en: 'Repubblica',             it: 'Repubblica' },
  'al-garghet':                   { en: 'Vigentino',              it: 'Vigentino' },
  'casa-fiori-chiari':            { en: 'Brera',                  it: 'Brera' },
  'cru-arco':                     { en: 'Arco della Pace',        it: 'Arco della Pace' },
  'lubarino':                     { en: 'Cinque Vie',             it: 'Cinque Vie' },
  'lubar':                        { en: 'Porta Venezia',          it: 'Porta Venezia' },
  'bon-wei':                      { en: 'Sempione',               it: 'Sempione' },
  'bacaro-montenapoleone':        { en: 'Montenapoleone',         it: 'Montenapoleone' },
  'al-fresco':                    { en: 'Solari',                 it: 'Solari' },
  'pasticceria-sissi':            { en: 'Porta Venezia',          it: 'Porta Venezia' },
  'drinc-different':              { en: 'Citta Studi',            it: 'Citta Studi' },
  'iyo':                          { en: 'CityLife',               it: 'CityLife' },
  'langosteria-bar':              { en: 'Quadrilatero',           it: 'Quadrilatero' },
  'dim-sum':                      { en: 'Repubblica',             it: 'Repubblica' },
  'el-porteno-prohibido':         { en: 'Porta Venezia',          it: 'Porta Venezia' },
  'loste-cafe':                   { en: 'Porta Venezia',          it: 'Porta Venezia' },
  'wicky-s':                      { en: 'Crocetta',               it: 'Crocetta' },
  'ribot':                        { en: 'San Siro',               it: 'San Siro' },
  'hostaria-terza-carbonaia':     { en: 'Citta Studi',            it: 'Citta Studi' },
  'la-brisa':                     { en: 'Magenta',                it: 'Magenta' },
  'serra-di-quartiere':           { en: 'Lima',                   it: 'Lima' },
  'lacerba':                      { en: 'Porta Romana',           it: 'Porta Romana' },
  'flow':                         { en: 'Cinque Vie',             it: 'Cinque Vie' },
  'marchesi-1824':                { en: 'Duomo',                  it: 'Duomo' },
  'cantine-isola':                { en: 'Paolo Sarpi',             it: 'Paolo Sarpi' },
  'fondazione-prada':             { en: 'Lodi',                   it: 'Lodi' },
  'bar-luce':                     { en: 'Lodi',                   it: 'Lodi' },
  'pinacoteca-di-brera':          { en: 'Brera',                  it: 'Brera' },
  'trattoria-torre-di-pisa':      { en: 'Brera',                  it: 'Brera' },
  'kanpai':                       { en: 'Porta Venezia',          it: 'Porta Venezia' },
  'mudec':                        { en: 'Tortona',                it: 'Tortona' },
  'spirit-de-milan':              { en: 'Affori',                 it: 'Affori' },
  'triennale':                    { en: 'Sempione',               it: 'Sempione' },
  'mag-cafe':                     { en: 'Navigli',                it: 'Navigli' },
  'orsonero-coffee':              { en: 'Buenos Aires',           it: 'Buenos Aires' },
  'paper-moon-giardino':          { en: 'Quadrilatero',           it: 'Quadrilatero' },
  'nottingham-forest':            { en: 'Porta Venezia',          it: 'Porta Venezia' },
  'il-salumaio-di-montenapoleone':{ en: 'Montenapoleone',         it: 'Montenapoleone' },
  'ba':                           { en: 'Wagner',                 it: 'Wagner' },
  'pasticceria-stefanelli':       { en: 'Porta Vittoria',         it: 'Porta Vittoria' },
  'rotonda-della-besana':         { en: 'Porta Romana',           it: 'Porta Romana' },
  'ta-hua':                       { en: 'Repubblica',             it: 'Repubblica' },
  'dal-bolognese':                { en: 'Crocetta',               it: 'Crocetta' },
  'chateau-dufan':                { en: 'Paolo Sarpi',             it: 'Paolo Sarpi' },
  'ydun':                         { en: 'Crocetta',               it: 'Crocetta' },
  'teatro-alla-scala':            { en: 'Duomo',                  it: 'Duomo' },
  'al-matarel':                   { en: 'Brera',                  it: 'Brera' },
  'ditta-artigianale':            { en: 'Magenta',                it: 'Magenta' },
  'cafezal-solferino':            { en: 'Brera',                  it: 'Brera' },
  'cafezal-premuda':              { en: 'Porta Vittoria',         it: 'Porta Vittoria' },

  // ===== Rio (only generic ones) =====
  'mac-niteroi':                  { en: 'Niteroi',                it: 'Niteroi' },
  'prainha-beach':                { en: 'Recreio dos Bandeirantes', it: 'Recreio dos Bandeirantes' },
  'praia-vermelha':               { en: 'Urca',                   it: 'Urca' },
  'praia-barra-tijuca':           { en: 'Barra da Tijuca',        it: 'Barra da Tijuca' },
  'praia-leblon':                 { en: 'Leblon',                 it: 'Leblon' },
};

const cityLabel = {
  milan: { en: 'Milan',          it: 'Milano' },
  rio:   { en: 'Rio de Janeiro', it: 'Rio de Janeiro' },
};

let updated = 0;
for (const spot of spots) {
  const o = overrides[spot.id];
  if (!o) continue;
  const c = cityLabel[spot.city] || { en: '', it: '' };
  const newEn = `${o.en}, ${c.en}`;
  const newIt = `${o.it}, ${c.it}`;
  if (spot.neighborhood.en !== newEn || spot.neighborhood.it !== newIt) {
    spot.neighborhood = { en: newEn, it: newIt };
    updated++;
  }
}

fs.writeFileSync(SPOTS_PATH, JSON.stringify(spots, null, 2) + '\n');
console.log(`updated ${updated} spots`);
