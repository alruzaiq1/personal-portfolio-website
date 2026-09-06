# Design audit

This portfolio uses a dark, editorial foundation with orange as the active accent. The direction is intentionally quiet enough to keep the project work readable while the hero provides the strongest visual moment.

| Area | Existing site | Reference direction | Change priority |
| --- | --- | --- | --- |
| Visual tone | A basic dark page with a small orange accent treatment | Batcloud handoff: dark/orange atmosphere with a particle-led visual | Establish a deeper dark palette and reserve orange for active moments. |
| Hero composition | An Arial greeting, “Hi, I’m Mohammed.”, with limited hierarchy | Lama Lama screenshot: bold oversized type, compressed supporting labels, strong composition | Make the headline the main visual element and use small labels to structure it. |
| Motion | A static dotted elliptical wave | Batcloud handoff suggests an ambient particle treatment | Add optional canvas motion, retain a static fallback, and honor reduced-motion preferences. |
| Project work | Three planned project rows with empty descriptions and hidden technology lists | Editorial work showcase | Put the existing portfolio project first and keep future concepts explicitly planned. |
| Information design | Numbered sections and status labels with uneven hierarchy | Lama Lama screenshot: compact labels against very large display type | Refine existing section numbers and status labels, and expose technical metadata as small navigational anchors. |
| Small screens | A basic mobile menu without reduced-motion or Escape-key behavior | Same hierarchy at a narrower width | Make the navigation and project feature comfortable to use at narrow widths. |

## Reference limits

The Batcloud media did not render during review, so the particle and dark-orange direction above follows the supplied handoff rather than details observed from that reference. The Lama Lama direction is based on the visible large hero typography and compact monospace labels; it is a directional influence, not a copied layout.

## Architecture

`index.html` contains the semantic document structure: header navigation, hero, numbered content sections, contact area, and footer. Sections use descriptive class names so content and layout remain separate.

`style.css` is organized by responsibility. It starts with shared tokens and base rules, then moves through navigation, hero and art fallback, projects, content sections, responsive compositions, and reduced-motion overrides. The CSS custom properties at the top define the palette, content width, gutters, section rhythm, monospace face, and animation easing.

`script.js` adds progressive enhancement only. The page remains navigable without JavaScript, while script-controlled features can enhance navigation state and the hero particle field. The CSS orbit remains available as a visual fallback when the canvas is unavailable, and `prefers-reduced-motion` disables animation.

The project section uses a featured-project composition for the portfolio itself and a separate archive-style grid for planned work. This preserves a clear distinction between existing work and future ideas.

## Next review priorities

1. Check the hero at desktop and mobile widths, especially the balance between heading and particle field.
2. Confirm the screenshot crop remains legible and current as the live portfolio evolves.
3. Check keyboard focus states, reduced motion, and the mobile navigation after any interaction changes.

## References

- [Bat Cloud](https://batcloud.art/) — visual direction from the supplied handoff; media unavailable during inspection.
- [Lama Lama](https://lamalama.com/) — oversized type, compact labels, and a strong visual hierarchy.

