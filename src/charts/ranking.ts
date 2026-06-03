import * as Plot from '@observablehq/plot'
import { loadNacional } from '../data'
import { COUNTRY_ES } from '../theme'

const PLOT_STYLE = { fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '12px', background: 'transparent', color: '#15233b' }

export async function renderRankingP1(container: HTMLElement, year = 2025): Promise<void> {
  const data = await loadNacional()
  const rows = data
    .filter((d) => d.anio === year && d.tecnologia_cod === 'E_AI_TANY' && d.pct != null && d.pais !== 'EU27_2020')
    .map((d) => ({ nombre: COUNTRY_ES[d.pais] ?? d.pais, pct: d.pct as number, quien: d.pais === 'ES' ? 'España' : 'Resto UE' }))
    .sort((a, b) => b.pct - a.pct)

  const chart = Plot.plot({
    marginLeft: 98, marginRight: 38, marginTop: 4, marginBottom: 28,
    width: 430, height: 24 * rows.length + 32,
    style: PLOT_STYLE,
    x: { label: '% empresas', grid: true, tickFormat: (d) => d + '%' },
    y: { label: null, domain: rows.map((r) => r.nombre) },
    color: { domain: ['España', 'Resto UE'], range: ['#e3742e', '#9cc1e6'] },
    marks: [
      Plot.barX(rows, { x: 'pct', y: 'nombre', fill: 'quien', rx: 2 }),
      Plot.text(rows, { x: 'pct', y: 'nombre', text: (d) => d.pct.toFixed(0) + '%', dx: 5, textAnchor: 'start', fontSize: 11, fill: '#51607a' }),
      Plot.ruleX([0]),
    ],
  })

  container.innerHTML = ''
  container.append(chart)
}
