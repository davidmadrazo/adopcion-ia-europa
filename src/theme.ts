// Sistema de color para datos. Todas las paletas son colorblind-safe.

// Categórica (tipos de IA, tamaños): paleta Okabe-Ito (8 tonos + negro),
// distinguibles bajo deuteranopia/protanopia/tritanopia.
export const OKABE_ITO = [
  '#0072B2', // azul
  '#E69F00', // naranja
  '#009E73', // verde
  '#CC79A7', // rosa
  '#56B4E9', // azul cielo
  '#D55E00', // bermellón
  '#F0E442', // amarillo
  '#999999', // gris
  '#000000', // negro
] as const

// Secuencial (adopción IA · mapa): single-hue azul.
export const SEQ_BLUE = ['#eaf2fb', '#c6dcf1', '#94bfe3', '#5b97cf', '#2f6db0', '#134a85'] as const

// Divergente (brechas: género, gap oferta-demanda): PuOr/BrBG, sin rojo-verde.
export const DIVERGING = ['#8c510a', '#d8b365', '#f6e8c3', '#f5f5f5', '#c7eae5', '#5ab4ac', '#01665e'] as const

export const COLOR_ES = '#e3742e' // coral de resalte para España
export const INK = '#15233b'
export const INK_FAINT = '#8a96ab'
export const LINE = '#e3e8ef'

// Etiquetas legibles de las tecnologías de IA (en orden narrativo).
export const TECH_LABELS: Record<string, string> = {
  E_AI_TANY: 'Cualquier IA',
  E_AI_TML: 'Machine learning',
  E_AI_TTM: 'Minería de texto',
  E_AI_TSR: 'Reconocimiento de voz',
  E_AI_TNLG: 'Generación de lenguaje',
  E_AI_TPVSG: 'Generación de imagen/audio',
  E_AI_TIR: 'Visión por computador',
  E_AI_TPA: 'Automatización de procesos',
  E_AI_TAR: 'Robots autónomos',
}

export const SIZE_LABELS: Record<string, string> = {
  GE10: 'Total (≥10)',
  '10-49': 'Pequeñas (10-49)',
  '50-249': 'Medianas (50-249)',
  GE250: 'Grandes (≥250)',
}

// Nombres de países (ISO Eurostat -> español) para ejes y tooltips.
export const COUNTRY_ES: Record<string, string> = {
  AT: 'Austria', BE: 'Bélgica', BG: 'Bulgaria', HR: 'Croacia', CY: 'Chipre',
  CZ: 'Chequia', DK: 'Dinamarca', EE: 'Estonia', FI: 'Finlandia', FR: 'Francia',
  DE: 'Alemania', EL: 'Grecia', HU: 'Hungría', IE: 'Irlanda', IT: 'Italia',
  LV: 'Letonia', LT: 'Lituania', LU: 'Luxemburgo', MT: 'Malta', NL: 'Países Bajos',
  PL: 'Polonia', PT: 'Portugal', RO: 'Rumanía', SK: 'Eslovaquia', SI: 'Eslovenia',
  ES: 'España', SE: 'Suecia', EU27_2020: 'UE-27',
}

// Etiquetas de sectores NACE (códigos del explorador) en español.
export const SECTOR_LABELS: Record<string, string> = {
  C: 'Manufactura', D_E: 'Energía, agua y residuos', F: 'Construcción', G: 'Comercio',
  H: 'Transporte y logística', I: 'Hostelería', J: 'Información y comunicación',
  L: 'Inmobiliario', M: 'Servicios profesionales', N: 'Servicios administrativos',
}
