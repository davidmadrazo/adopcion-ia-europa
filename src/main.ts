import './styles/tokens.css'
import './styles/base.css'
import './styles/charts.css'
import { renderMapP1 } from './charts/map'
import { renderRankingP1 } from './charts/ranking'
import { renderBarsP2 } from './charts/bars'
import { renderLinesP3 } from './charts/lines'
import { renderScatterP4 } from './charts/scatter'
import { renderExplorer } from './charts/explorer'

// Año dinámico en el footer.
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = String(new Date().getFullYear())

const mount = (id: string, fn: (el: HTMLElement) => Promise<void>) => {
  const el = document.getElementById(id)
  if (el) fn(el).catch((e) => console.error(`${id}:`, e))
}

// P1 — Mapa + ranking sincronizados por año
const mapEl = document.getElementById('map-p1')
const rankEl = document.getElementById('rank-p1')
const rankTitle = document.getElementById('rank-title')
if (rankEl) renderRankingP1(rankEl, 2025).catch((e) => console.error('rank-p1:', e))
if (mapEl) {
  renderMapP1(mapEl, {
    initialYear: 2025,
    onYear: (y) => {
      if (rankEl) renderRankingP1(rankEl, y).catch(() => {})
      if (rankTitle) rankTitle.textContent = `Ranking ${y}`
    },
  }).catch((e) => console.error('map-p1:', e))
}

// P2 tipos de IA · P3 tamaño · P4 talento+género · Explorador
mount('bars-p2', renderBarsP2)
mount('lines-p3', renderLinesP3)
mount('scatter-p4', renderScatterP4)
mount('explorer', renderExplorer)

// Narrativa guiada: revelar cabeceras y figuras al entrar en el viewport.
const reveals = document.querySelectorAll<HTMLElement>('.act__head, .figure')
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target) }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  )
  reveals.forEach((el) => { el.classList.add('reveal'); io.observe(el) })
}

console.info('IA · Europa — narrativa + explorador montados')
