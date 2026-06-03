import * as d3 from 'd3'

const num = (v: string | undefined): number | null => (v == null || v === '' ? null : +v)

export interface NacionalRow { pais: string; anio: number; tecnologia_cod: string; tecnologia: string; pct: number | null; flag: string | null }
export interface TamanoRow { pais: string; anio: number; size_emp: string; size_label: string; pct: number | null; flag: string | null }
export interface HabRow { pais: string; anio: number; ind_type: string; sexo: string; grupo: string; indic_is: string; indicador: string; pct: number | null; flag: string | null }
export interface MetricaRow { pais: string; anio: number; adopcion_ia: number | null; brecha_tamano: number | null; hab_avanzada_total: number | null; brecha_genero_hab: number | null; delta_ia_2325: number | null; gap_oferta_demanda: number | null }
export interface SectorRow { pais: string; anio: number; sector_cod: string; sector: string; tecnologia_cod: string; tecnologia: string; pct: number | null; flag: string | null }

export const loadNacional = (): Promise<NacionalRow[]> =>
  d3.csv('data/adopcion_nacional.csv', (d): NacionalRow => ({
    pais: d.pais!, anio: +d.anio!, tecnologia_cod: d.tecnologia_cod!, tecnologia: d.tecnologia!,
    pct: num(d.pct), flag: d.flag || null,
  })) as Promise<NacionalRow[]>

export const loadTamano = (): Promise<TamanoRow[]> =>
  d3.csv('data/adopcion_tamano.csv', (d): TamanoRow => ({
    pais: d.pais!, anio: +d.anio!, size_emp: d.size_emp!, size_label: d.size_label!,
    pct: num(d.pct), flag: d.flag || null,
  })) as Promise<TamanoRow[]>

export const loadHabilidades = (): Promise<HabRow[]> =>
  d3.csv('data/habilidades.csv', (d): HabRow => ({
    pais: d.pais!, anio: +d.anio!, ind_type: d.ind_type!, sexo: d.sexo!, grupo: d.grupo!,
    indic_is: d.indic_is!, indicador: d.indicador!, pct: num(d.pct), flag: d.flag || null,
  })) as Promise<HabRow[]>

export const loadMetricas = (): Promise<MetricaRow[]> =>
  d3.csv('data/metricas_pais_anio.csv', (d): MetricaRow => ({
    pais: d.pais!, anio: +d.anio!, adopcion_ia: num(d.adopcion_ia), brecha_tamano: num(d.brecha_tamano),
    hab_avanzada_total: num(d.hab_avanzada_total), brecha_genero_hab: num(d.brecha_genero_hab),
    delta_ia_2325: num(d.delta_ia_2325), gap_oferta_demanda: num(d.gap_oferta_demanda),
  })) as Promise<MetricaRow[]>

export const loadSector = (): Promise<SectorRow[]> =>
  d3.csv('data/adopcion_sector.csv', (d): SectorRow => ({
    pais: d.pais!, anio: +d.anio!, sector_cod: d.sector_cod!, sector: d.sector!,
    tecnologia_cod: d.tecnologia_cod!, tecnologia: d.tecnologia!, pct: num(d.pct), flag: d.flag || null,
  })) as Promise<SectorRow[]>

export const loadSectorTop = (): Promise<SectorRow[]> =>
  d3.csv('data/adopcion_sector_top.csv', (d): SectorRow => ({
    pais: d.pais!, anio: +d.anio!, sector_cod: d.sector_cod!, sector: d.sector!,
    tecnologia_cod: d.tecnologia_cod!, tecnologia: d.tecnologia!, pct: num(d.pct), flag: d.flag || null,
  })) as Promise<SectorRow[]>
