# Memory: index.md
Updated: now

# Fermin Turban Portfolio — Design System

## Fonts
- Display: Bebas Neue (headings, titles)
- Body: Barlow (body text, nav, labels)

## Colors (HSL)
- Background: 0 0% 4% (near-black)
- Foreground: 40 10% 90% (warm off-white)
- Primary: 30 80% 55% (warm amber)
- Accent: 8 70% 45% (deep red)
- All secondary/muted are neutral dark tones

## Design direction
- Cinematic, dark, editorial, film-grain aesthetic
- Bilingual: Spanish (UY) + English (US)
- Video-first portfolio
- Grain overlay animation on all pages
- Film burn texture backgrounds (hero-texture.jpg, page-texture.jpg)

## i18n
- react-i18next with URL prefix routing (/es/, /en/)
- Auto-detection: localStorage → browser lang → default es
- Translated routes: /es/publicidad ↔ /en/advertising
- Translated project slugs via slugEn field
- Language selector in footer, saves to localStorage

## Key decisions
- Featured sections use horizontal filmstrip scroll
- Page transitions: cinematic wipe bar + fade
- Project cards show thumbnail with scanline hover effect + dark overlay lift
- Generated placeholder thumbnails for featured projects (audi, natalia-oreiro, mercado-pago, higuita, colombia)
