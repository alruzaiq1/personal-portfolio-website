# Validation record

Checked on 7 September 2026 in the Codex in-app browser.

- Visual checks at 320 × 740, 390 × 844, 768 × 1024, 1280 × 720, and 1440 × 1000.
- No document horizontal overflow at tested widths. The deliberately cropped decorative canvas stays inside the hero.
- Narrow-phone headline clipping and tablet motion-control clipping found and corrected.
- Mobile menu opens, closes on link selection, and closes with Escape while restoring focus.
- Project anchor selects the correct active navigation item after the section reorder.
- Pause control changes to Play and reports its paused state.
- Featured project, original screenshot, and mobile contact layout visually inspected.
- No missing local anchor targets, broken loaded images, or browser warning/error logs in final inspection.
- Four Node regression checks pass for document-order navigation, mobile menu interactions, reduced-motion static rendering, and animation lifecycle/pause behavior.
- JavaScript syntax check and Git whitespace check pass.

The Node checks use browser stubs; reduced motion and background/offscreen scheduling were tested there. This is not a full assistive-technology or cross-browser audit. System typography can differ across operating systems. The original screenshot remains clearly labeled as a first-iteration image. External project/social destinations were preserved rather than treated as verified deployed V2 pages.
