import * as Plot from '@observablehq/plot'
import { loadSectorTop } from '../data'
import { COUNTRY_ES, TECH_LABELS, SECTOR_LABELS } from '../theme'

const PLOT_STYLE = { fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: '12px', background: 'transparent', color: '#15233b' }

export async function renderExplorer(container: HTMLElement): Promise<void> {
  const data = await loadSectorTop()

  const paises = [...new Set(data.map((d) => d.pais))]
    .filter((p) => p !== 'EU27_2020')
    .sort((a, b) => (COUNTRY_ES[a] ?? a).localeCompare(COUNTRY_ES[b] ?? b))
  const anios = [...new Set(data.map((d) => d.anio))].sort((a, b) => a - b)
  const techs = [...new Set(data.map((d) => d.tecnologia_cod))]
    .sort((a, b) => (a === 'E_AI_TANY' ? -1 : b === 'E_AI_TANY' ? 1 : 0))

  const state = { pais: 'ES', anio: 2025, tech: 'E_AI_TANY' }

  container.innerHTML = ''

  const controls = document.createElement('div')
  controls.className = 'explorer-controls'
  const mkSelect = (label: string, options: { value: string; text: string }[], value: string, onChange: (v: string) => void) => {
    const wrap = document.createElement('label')
    wrap.className = 'control'
    const span = document.createElement('span')
    span.textContent = label
    const sel = document.createElement('select')
    for (const o of options) {
      const op = document.createElement('option')
      op.value = o.value
      op.textContent = o.text
      if (o.value === value) op.selected = true
      sel.appendChild(op)
    }
    sel.addEventListener('change', () => onChange(sel.value))
    wrap.append(span, sel)
    return wrap
  }
  controls.appendChild(mkSelect('País', paises.map((p) => ({ value: p, text: COUNTRY_ES[p] ?? p })), state.pais, (v) => { state.pais = v; update() }))
  controls.appendChild(mkSelect('Año', anios.map((a) => ({ value: String(a), text: String(a) })), String(state.anio), (v) => { state.anio = +v; update() }))
  controls.appendChild(mkSelect('Tecnología', techs.map((t) => ({ value: t, text: TECH_LABELS[t] ?? t })), state.tech, (v) => { state.tech = v; update() }))
  container.appendChild(controls)

  const chartHost = document.createElement('div')
  chartHost.className = 'chart'
  container.appendChild(chartHost)

  const note = document.createElement('p')
  note.className = 'explorer-note'
  note.innerHTML = 'Barra azul: país seleccionado. Marca coral: media de la UE-27 (referencia para comparar).'
  container.appendChild(note)

  function update() {
    const sel = data.filter((d) => d.anio === state.anio && d.tecnologia_cod === state.tech)
    const pais = sel.filter((d) => d.pais === state.pais && d.pct != null)
      .map((d) => ({ sector: SECTOR_LABELS[d.sector_cod] ?? d.sector, pct: d.pct as number }))
    const eu = sel.filter((d) => d.pais === 'EU27_2020' && d.pct != null)
      .map((d) => ({ sector: SECTOR_LABELS[d.sector_cod] ?? d.sector, pct: d.pct as number }))
    const order = pais.slice().sort((a, b) => b.pct - a.pct).map((d) => d.sector)

    const chart = Plot.plot({
      marginLeft: 170, marginRight: 28, marginTop: 8, marginBottom: 34,
      width: 900, height: 430,
      style: PLOT_STYLE,
      x: { label: '% de empresas →', grid: true, tickFormat: (d) => d + '%' },
      y: { label: null, domain: order.length ? order : undefined },
      marks: [
        Plot.barX(pais, { x: 'pct', y: 'sector', fill: '#2f6db0', rx: 1, tip: true }),
        Plot.tickX(eu, { x: 'pct', y: 'sector', stroke: '#e3742e', strokeWidth: 2.5 }),
        Plot.ruleX([0]),
      ],
    })
    chartHost.replaceChildren(chart)
  }

  update()
}
