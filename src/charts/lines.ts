import * as Plot from '@observablehq/plot'
import { loadTamano } from '../data'

const SIZES = ['10-49', '50-249', 'GE250']
const LABELS: Record<string, string> = { '10-49': 'Pequeñas (10-49)', '50-249': 'Medianas (50-249)', GE250: 'Grandes (≥250)' }
const COLORS: Record<string, string> = { '10-49': '#94bfe3', '50-249': '#2f6db0', GE250: '#0a3d73' }
const PLOT_STYLE = { fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '12px', background: 'transparent', color: '#15233b' }

export async function renderLinesP3(container: HTMLElement): Promise<void> {
  const data = await loadTamano()
  const rows = data
    .filter((d) => d.pais === 'EU27_2020' && SIZES.includes(d.size_emp) && d.pct != null)
    .map((d) => ({ anio: d.anio, label: LABELS[d.size_emp], pct: d.pct as number }))

  const chart = Plot.plot({
    marginLeft: 44, marginRight: 142, marginTop: 22, marginBottom: 34,
    width: 900, height: 420,
    style: PLOT_STYLE,
    x: { label: null, ticks: [2021, 2023, 2024, 2025], tickFormat: 'd' },
    y: { label: '↑ % de empresas que usan IA', grid: true, tickFormat: (d) => d + '%', domain: [0, 50] },
    color: { domain: SIZES.map((s) => LABELS[s]), range: SIZES.map((s) => COLORS[s]) },
    marks: [
      Plot.line(rows, { x: 'anio', y: 'pct', stroke: 'label', strokeWidth: 2.75 }),
      Plot.dot(rows, {
        x: { value: 'anio', label: 'Año' },
        y: { value: 'pct', label: '% empresas' },
        fill: { value: 'label', label: 'Tamaño' },
        r: 3.75,
        tip: { format: { x: (d: number) => String(d), y: (d: number) => d.toFixed(1) + '%', fill: true } },
      }),
      Plot.text(
        rows.filter((r) => r.anio === 2025),
        { x: 'anio', y: 'pct', text: 'label', dx: 10, textAnchor: 'start', fontSize: 12, fontWeight: 600, fill: 'label' },
      ),
      Plot.ruleY([0]),
    ],
  })

  container.innerHTML = ''
  container.append(chart)
}
