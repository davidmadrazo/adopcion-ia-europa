# Europa, a dos velocidades

Visualización interactiva sobre la **adopción de la inteligencia artificial en las empresas europeas** (datos de Eurostat, 2025) y su relación con el capital humano digital, con perspectiva de género.

Práctica de **Visualización de datos** — Máster Universitario en Ciencia de Datos, Universitat Oberta de Catalunya (UOC). Autor: **David Madrazo Martínez**.

🔗 **Visualización en vivo:** https://davidmadrazo.github.io/adopcion-ia-europa/

## Qué responde

1. **Panorama** — ¿Qué países lideran la adopción de IA y dónde queda España? (mapa coroplético + ranking)
2. **Tecnologías** — ¿Qué tipos de IA usan las empresas y cómo irrumpió la IA generativa? (barras por año)
3. **Tamaño** — ¿Se ensancha la brecha entre grandes empresas y pymes? (líneas 2021–2025)
4. **Talento** — ¿Sostiene el talento digital la adopción? ¿Y la brecha de género? (diagrama de dispersión)

Incluye además un **explorador** libre (país × año × tecnología × sector, con la media UE-27 como referencia) y un panel de **metodología** con las fórmulas de las métricas derivadas.

## Stack

Vite · TypeScript · D3 · Observable Plot · Scrollama. Sitio estático, sin dependencias de servidor. Paletas de color *colorblind-safe* y soporte de `prefers-reduced-motion`.

## Desarrollo local

```bash
npm install
npm run dev       # servidor de desarrollo (http://localhost:5173)
npm run build     # build de producción en dist/
npm run preview   # previsualizar el build
```

## Datos

Cuatro tablas públicas de Eurostat, bajo licencia Commission Decision 2011/833/EU:
`isoc_eb_ai`, `isoc_eb_ain2`, `isoc_sk_dskl_i21`, `isoc_e_dii`.

La preparación de datos (descarga vía API SDMX, decodificación de códigos Eurostat y cálculo de las métricas derivadas) está documentada en [`etl/`](etl/). Los datos ya procesados que consume la visualización están en `public/data/`.

## Licencia

Código bajo licencia [MIT](LICENSE). Datos © Unión Europea, Eurostat.
