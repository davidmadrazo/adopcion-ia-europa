import * as d3 from 'd3'
import { feature } from 'topojson-client'
import { SEQ_BLUE, COUNTRY_ES } from '../theme'
import { loadNacional } from '../data'

const UE27 = new Set(['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'EL',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'])
const CONTEXT = new Set(['NO', 'CH', 'UK', 'IS', 'RS', 'BA', 'ME', 'MK', 'AL', 'XK', 'TR',
  'UA', 'MD', 'BY', 'RU', 'MA', 'DZ', 'TN', 'LI', 'AD', 'SM'])

const BREAKS = [5, 10, 15, 25, 35]
const LEGEND = ['< 5%', '5–10%', '10–15%', '15–25%', '25–35%', '≥ 35%']
const YEARS = [2021, 2023, 2024, 2025]

// Ventana europea en EPSG:3035 (metros): recorta el mapa y evita que los
// territorios de ultramar deformen la escala.
const EU_WINDOW = {
  type: 'Polygon',
  coordinates: [[[2500000, 1380000], [6650000, 1380000], [6650000, 5450000], [2500000, 5450000], [2500000, 1380000]]],
} as const

interface MapOpts { initialYear?: number; onYear?: (year: number) => void }

export async function renderMapP1(container: HTMLElement, opts: MapOpts = {}): Promise<void> {
  const initialYear = opts.initialYear ?? 2025
  const [topo, data] = await Promise.all([d3.json<any>('data/europe-3035.topo.json'), loadNacional()])
  if (!topo) return

  const objName = Object.keys(topo.objects)[0]
  const fc: any = feature(topo, topo.objects[objName])
  const ue = fc.features.filter((f: any) => UE27.has(f.id))
  const context = fc.features.filter((f: any) => CONTEXT.has(f.id))

  const color = d3.scaleThreshold<number, string>().domain(BREAKS).range(SEQ_BLUE as unknown as string[])
  const valueFor = (year: number) => {
    const m = new Map<string, number>()
    for (const d of data) {
      if (d.anio === year && d.tecnologia_cod === 'E_AI_TANY' && d.pct != null) m.set(d.pais, d.pct)
    }
    return m
  }
  let current = valueFor(initialYear)
  const fillFor = (id: string) => (current.has(id) ? color(current.get(id)!) : '#e9edf3')

  const W = 720, H = 720
  const proj = d3.geoIdentity().reflectY(true).fitExtent([[12, 12], [W - 12, H - 12]], EU_WINDOW as any)
  const path = d3.geoPath(proj as any)

  container.innerHTML = ''

  // Control de años
  const toolbar = d3.select(container).append('div')
    .attr('class', 'chart-toolbar').attr('role', 'group').attr('aria-label', 'Seleccionar año')
  const buttons = toolbar.selectAll('button').data(YEARS).join('button')
    .attr('class', 'yr-btn').attr('type', 'button').text((d) => String(d))
    .on('click', (_e: PointerEvent, d: number) => setYear(d))

  const svg = d3.select(container).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('role', 'img')
  svg.append('g').selectAll('path').data(context).join('path').attr('d', path as any).attr('class', 'map-context')

  let tip = document.querySelector('.map-tooltip') as HTMLElement | null
  if (!tip) { tip = document.createElement('div'); tip.className = 'map-tooltip'; document.body.appendChild(tip) }

  const uePaths = svg.append('g').selectAll('path').data(ue).join('path')
    .attr('d', path as any)
    .attr('class', (f: any) => 'map-country' + (f.id === 'ES' ? ' map-es' : ''))
    .on('mousemove', (event: MouseEvent, f: any) => {
      const v = current.get(f.id)
      const name = COUNTRY_ES[f.id] ?? f.properties?.NAME_ENGL ?? f.id
      tip!.innerHTML = `<strong>${name}</strong><br><span class="tt-val">${v != null ? v.toFixed(1) + '%' : 'sin dato'}</span>`
      tip!.style.opacity = '1'
      tip!.style.left = `${event.clientX + 14}px`
      tip!.style.top = `${event.clientY + 14}px`
    })
    .on('mouseleave', () => { tip!.style.opacity = '0' })
  svg.selectAll<SVGPathElement, unknown>('.map-es').raise()

  // Leyenda
  const legend = d3.select(container).append('div').attr('class', 'legend').attr('aria-hidden', 'true')
  const items = legend.selectAll('div').data(color.range()).join('div').attr('class', 'legend__item')
  items.append('span').attr('class', 'legend__swatch').style('background', (d) => d as string)
  items.append('span').text((_, i) => LEGEND[i])

  // Tabla accesible
  const table = d3.select(container).append('table').attr('class', 'sr-only')
  const caption = table.append('caption')
  const tbody = table.append('tbody')

  function setYear(year: number, silent = false): void {
    current = valueFor(year)
    uePaths.attr('fill', (f: any) => fillFor(f.id))
    buttons.attr('aria-pressed', (d) => (d === year ? 'true' : 'false'))
    svg.attr('aria-label', `Mapa de adopción de IA en empresas europeas en ${year}. ` +
      `Lideran los países nórdicos y el Benelux; España se sitúa en torno a la media de la UE.`)
    caption.text(`Adopción de IA por país en ${year} (% de empresas de ≥10 empleados)`)
    const ranked = [...current.entries()].filter(([k]) => UE27.has(k)).sort((a, b) => b[1] - a[1])
    tbody.selectAll('tr').remove()
    for (const [k, v] of ranked) {
      const tr = tbody.append('tr')
      tr.append('th').attr('scope', 'row').text(COUNTRY_ES[k] ?? k)
      tr.append('td').text(`${v.toFixed(1)}%`)
    }
    if (!silent) opts.onYear?.(year)
  }

  setYear(initialYear, true)
}
