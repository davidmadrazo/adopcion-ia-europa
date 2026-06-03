import * as Plot from '@observablehq/plot'
import { loadMetricas } from '../data'

const PLOT_STYLE = { fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '12px', background: 'transparent', color: '#15233b' }

export async function renderScatterP4(container: HTMLElement, year = 2025): Promise<void> {
  const data = await loadMetricas()
  const rows = data
    .filter((d) => d.anio === year && d.pais !== 'EU27_2020' && d.adopcion_ia != null && d.hab_avanzada_total != null)
    .map((d) => ({ pais: d.pais, x: d.hab_avanzada_total as number, y: d.adopcion_ia as number, gap: d.brecha_genero_hab }))

  const chart = Plot.plot({
    marginLeft: 48, marginBottom: 48, marginTop: 16, marginRight: 18,
    width: 900, height: 560,
    style: PLOT_STYLE,
    grid: true,
    x: { label: 'Población con habilidades digitales avanzadas (%) →', tickFormat: (d) => d + '%' },
    y: { label: '↑ Empresas que usan IA (%)', tickFormat: (d) => d + '%' },
    color: { scheme: 'BrBG', type: 'diverging', pivot: 0, reverse: true, legend: true, label: 'Brecha de género (pp, hombres − mujeres)' },
    marks: [
      Plot.linearRegressionY(rows, { x: 'x', y: 'y', stroke: '#c9d2df', strokeWidth: 1.5, fillOpacity: 0.06 }),
      Plot.dot(rows, {
        x: 'x', y: 'y', fill: 'gap', r: 7, stroke: '#fff', strokeWidth: 0.8,
        channels: { País: 'pais' },
        tip: { format: { País: true, x: (d: number) => d.toFixed(1) + '%', y: (d: number) => d.toFixed(1) + '%', fill: (d: number) => d.toFixed(1) + ' pp' } },
      }),
      Plot.text(rows, { x: 'x', y: 'y', text: 'pais', dy: -12, fontSize: 10, fill: '#51607a' }),
      Plot.dot(rows.filter((r) => r.pais === 'ES'), { x: 'x', y: 'y', r: 9.5, stroke: '#e3742e', strokeWidth: 2.5, fill: 'none' }),
    ],
  })

  container.innerHTML = ''
  container.append(chart)
}
