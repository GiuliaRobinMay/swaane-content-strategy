// Turns the Vite build into one self-contained page (CSS and JS inlined),
// in the shape the Claude artifact host expects: no <html>/<head>/<body>.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dist = new URL('../dist/', import.meta.url).pathname
const html = readFileSync(join(dist, 'index.html'), 'utf8')
const js = html.match(/<script type="module" crossorigin src="\.\/(assets\/[^"]+\.js)"><\/script>/)?.[1]
const css = html.match(/<link rel="stylesheet" crossorigin href="\.\/(assets\/[^"]+\.css)">/)?.[1]
if (!js || !css) throw new Error('Could not find the built JS or CSS in dist/index.html')

const script = readFileSync(join(dist, js), 'utf8').replace(/<\/script/gi, '<\\/script')
const style = readFileSync(join(dist, css), 'utf8').replace(/<\/style/gi, '<\\/style')

const page = `<title>Swaane Studio</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap">
<style>${style}</style>
<div id="root"></div>
<script type="module">${script}</script>
`
writeFileSync(join(dist, 'swaane-studio.html'), page)
console.log(`dist/swaane-studio.html written (${Math.round(page.length / 1024)} KB)`)
