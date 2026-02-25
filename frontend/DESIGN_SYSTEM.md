# ComplyAI Design System Roadmap

## Design Direction

Edgy tech + professional compliance:

- Dark base: `#0b0f14`
- Glass surfaces with subtle blur
- One accent gradient: neon green -> violet
- Strict risk semantics: red / yellow / green
- Motion explains product flow, never distracts

## Visual Tokens

- Base background: `#0b0f14`
- Accent gradient: `hsl(var(--accent-start)) -> hsl(var(--accent-end))`
- Risk low: green
- Risk medium: amber/yellow
- Risk high: red
- Typography
- `H1`: `--h1`
- `H2`: `--h2`
- Body: `--body`

## Motion Levels

- `Micro` (150-250ms): button/chip hover, card lift
- `Section` (300-600ms): reveal + staggered entry
- `Hero` (700-900ms): parallax depth and signature section

## Implementation Status

- [x] Phase A foundation in global tokens/components
- [x] Landing hero upgraded with parallax depth
- [x] Scroll-story "How it works" section
- [x] Signature compliance graph section
- [x] Dashboard shell shifted to premium dark frame
- [ ] Clause heat strip on results page
- [ ] Suggested fix diff highlighter
- [ ] Performance tuning for reduced-motion devices

## Next Build Order

1. Add clause heat strip and click-to-jump interaction on report page.
2. Build side-by-side original vs suggested diff with highlights.
3. Tune animation fallbacks for low-power and reduced-motion users.
4. Add optional smooth-scrolling enhancer for landing only.
