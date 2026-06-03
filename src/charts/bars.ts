import * as Plot from '@observablehq/plot'
import { loadNacional } from '../data'
import { TECH_LABELS } from '../theme'

const TECHS = ['E_AI_TML', 'E_AI_TTM', 'E_AI_TSR', 'E_AI_TNLG', 'E_AI_TPVSG', 'E_AI_TIR', 'E_AI_TPA', 'E_AI_TAR']
const YEARS = [2021, 2023, 2024, 2025]
const GEN = new Set(['E_AI_TNLG', 'E_AI_TPVSG'])

const PLOT_STYLE = { fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '12px', background: 'transparent', color: '#15233b' }

export async function renderBarsP2(container: HTMLElement): Promise<void> {
  const data = await loadNacional()
  const rows = data
    .filter((d) => d.pais === 'EU27_2020' && TECHS.includes(d.tecnologia_cod) && YEARS.includes(d.anio) && d.pct != null)
    .map((d) => ({
      tech: TECH_LABELS[d.tecnologia_cod],
      anio: String(d.anio),
      pct: d.pct as number,
      grupo: GEN.has(d.tecnologia_cod) ? 'IA generativa' : 'Otras tecnologías',
    }))

  const v2025 = new Map(rows.filter((r) => r.anio === '2025').map((r) => [r.tech, r.pct]))
  const techOrder = [...new Set(rows.map((r) => r.tech))].sort((a, b) => (v2025.get(b) ?? 0) - (v2025.get(a) ?? 0))

  const chart = Plot.plot({
    marginLeft: 158, marginTop: 30, marginBottom: 34, marginRight: 14,
    width: 1040, height: 340,
    style: PLOT_STYLE,
    x: { label: '% de empresas →', grid: true, ticks: 4, tickFormat: (d) => d + '%' },
    y: { label: null, domain: techOrder },
    fx: { label: null, domain: YEARS.map(String) },
    color: { domain: ['IA generativa', 'Otras tecnologías'], range: ['#E69F00', '#5b97cf'], legend: true },
    marks: [
      Plot.barX(rows, {
        fx: 'anio', y: 'tech', x: 'pct', fill: 'grupo', rx: 1,
        tip: { format: { fx: true, y: true, x: (d: number) => d.toFixed(1) + '%', fill: false } },
      }),
      Plot.ruleX([0]),
    ],
  })

  container.innerHTML = ''
  container.append(chart)
}
