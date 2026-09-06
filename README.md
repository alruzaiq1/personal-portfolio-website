# Mohammed Al Rizeiqi — Personal Portfolio

A vanilla HTML, CSS, and JavaScript portfolio documenting my learning as an Artificial Intelligence student at GUtech.

[Production website](https://www.alrizeiqi.com) · [Design and implementation notes](docs/design-notes.md)

This iteration evolves the original dark/orange portfolio with oversized typography, a pointer-responsive particle field, a featured project, and an editorial archive of planned work. The production URL reflects the deployed branch; changes on this branch are a preview until merged and deployed.

## Run locally

Open `index.html` directly in a modern browser, or use VS Code Live Server. No package installation or build step is required.

## Features

- Responsive desktop, tablet, and mobile compositions.
- Lightweight 2D canvas particle artwork with a static CSS fallback.
- Pause/play control, reduced-motion support, and animation suspension offscreen or in background tabs.
- Keyboard-accessible mobile menu with Escape handling and active-section navigation.
- Featured portfolio project with real links; three future projects explicitly marked Planned.
- Visible keyboard focus, skip link, semantic sections, and lazy-loaded project image with reserved dimensions.
- System font stacks: no remote font requests or animation dependencies.

## Structure

- `index.html`: content, semantic sections, links, and decorative canvas.
- `style.css`: design tokens, navigation, hero, projects, supporting sections, responsive rules, and reduced motion.
- `script.js`: navigation and particle animation in a private function scope.
- `tests/interactions.test.cjs`: dependency-free interaction regression checks.
- `docs/design-notes.md`: reference audit, design decisions, and explanations.
- `screenshots/`: original portfolio screenshots; the featured image is explicitly labeled as the first iteration.
- `CNAME`: existing GitHub Pages custom domain.

## Validation

With Node.js installed:

```sh
node --check script.js
node --test tests/interactions.test.cjs
```

The regression checks cover section ordering, mobile menu state/focus, reduced motion, the pause control, and animation suspension. They use browser stubs and complement visual browser checks; they do not replace a screen-reader or cross-browser audit.

## How the animation works

The canvas is decorative. JavaScript projects points on a gently changing torus into 2D, sorts them by depth, and draws orange dots. `requestAnimationFrame` follows the browser's paint cycle. Pointer events adjust the viewing angle; `ResizeObserver` keeps the canvas sized to its container. `IntersectionObserver` and page visibility events stop rendering when it cannot be seen. Mobile uses fewer points and pixel density is capped at 1.5.

If JavaScript is unavailable, the CSS dotted ellipse remains visible, all content stays readable, and mobile navigation stays expanded. If reduced motion is requested, the canvas draws a still frame and its motion control is hidden.

## Next content improvements

Replace the first-iteration screenshot when a new portfolio image is ready. Add real screenshots, outcomes, repositories, and live links as the planned projects are built. Do not present planned work as completed. Deeper case-study pages can follow once there is a process and result to document.
