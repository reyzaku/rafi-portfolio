# Work Page — "The Player" — Implementation Plan

Date: 2026-05-29
Spec: `docs/superpowers/specs/2026-05-29-work-page-the-player-design.md`
Builder: Sonnet
Route affected: `/work` only (no new routes)

> **READ FIRST (AGENTS.md):** This is a modified Next.js. Before writing any code that
> touches routing, `'use client'`, metadata, or fonts, read the relevant guide under
> `node_modules/next/dist/docs/`. Do not assume vanilla Next.js APIs.

> **Push policy:** Do NOT `git push` unless Rafi explicitly says to.

> **Design ownership:** Rafi owns all aesthetic/UI decisions. Build clean, neutral
> defaults; do not impose strong visual opinions. Wire up mechanics; leave look-and-feel
> easy for Rafi to tune.

---

## Goal

Replace the placeholder list in `src/app/work/page.tsx` with "The Player": a deck of
draggable project cards + a drop slot. Dragging a card into the slot boots that project
into a vertically-scrolling **Figma-canvas** detail view. Player collapses to a dock with
a remaining-cards tray; swapping ejects the current and boots the next; an Eject button
returns to the deck. Mobile falls back to tap-to-open.

## Definition of Done

- [ ] On desktop `/work`, cards are arranged mid-screen; an empty Player slot sits bottom-right.
- [ ] Dragging a card over the slot and releasing → boot animation → project detail renders.
- [ ] Detail view looks like a Figma canvas (dotted bg, framed artboards w/ name labels, ruler, selectable frames) and scrolls vertically.
- [ ] In playing mode, the Player is a compact dock (`NOW PLAYING — …` + Eject) and remaining projects show as a bottom card stack.
- [ ] Picking a tray card opens the slot; dropping a new card ejects current and boots new.
- [ ] Eject returns to the deck (State 1) and re-deals all cards.
- [ ] Rafi cursor reacts during drag/boot with loading-flavoured labels.
- [ ] Mobile (`< md` / `pointer: coarse`): vertical card list, tap opens detail, Back returns.
- [ ] No regressions to home page, transitions, ruler, or existing selection behaviour.
- [ ] `npm run build` / typecheck passes; lint clean.

---

## Step 0 — Recon (do before coding)

1. Read `node_modules/next/dist/docs/` sections relevant to client components & the app
   router for this fork.
2. Re-read these for exact APIs to reuse:
   - `src/components/hero/Hero.tsx` — manual drag impl (mousedown/move/up, `left/top` px,
     `.draggable`, `.is-grabbed`, `element-drag` event, `origPos` re-measure pattern).
   - `src/lib/selection-store.ts` — `selectionStore.get/set/subscribe`, `SelectionBounds`.
   - `src/components/ui/SelectionOverlay.tsx` — `ELEMENT_NAMES` label map + overlay render.
   - `src/components/ui/SelectionBox.tsx` — marquee; note it bails when `.is-grabbed` exists.
   - `src/components/ui/HomeOnlyLayer.tsx` — current home-only gate for selection chrome.
   - `src/components/ui/CustomCursor.tsx` — `LABELS`, listens to `element-drag/scale/rotate`.
   - `src/app/work/page.tsx` — current placeholder + fixed bg/grid pattern to preserve.

---

## Step 1 — Data model

Create `src/lib/work-data.ts`:

- Define `Frame` and `Project` types (per spec §3).
- Export `PROJECTS: Project[]` — port the 8 placeholder entries currently in
  `work/page.tsx`, and give each 3–5 placeholder `frames` (name + a placeholder
  image/body) so the canvas is testable. Use existing `/public` assets or simple
  colored placeholders; do not block on real art.

**Verify:** import compiles; `PROJECTS` typed correctly.

---

## Step 2 — Page shell

Edit `src/app/work/page.tsx`:

- Keep `<Nav />`, the fixed `bg.webp` background, and the grid overlay.
- Replace the project-list markup with `<WorkPlayer />`.
- Keep `'use client'` (drag + state need it). Confirm against the Next docs that this is
  still the correct directive in this fork.

**Verify:** `/work` renders Nav + background + an empty `WorkPlayer` placeholder.

---

## Step 3 — `ProjectCard`

`src/components/work/ProjectCard.tsx`:

- Presentational card: face shows title / year / tags / cover, neutral styling, rounded,
  subtle border. Accepts `project`, plus state flags (`inSlot`, `inTray`, `dragging`).
- Add `className="draggable"` only when it should be draggable (deck + tray), so it picks
  up the global hover-outline cue and matches the drag system's selector.
- No drag logic inside the card itself — the deck owns drag (mirrors Hero, where the
  section owns drag and `.draggable` elements are the targets).

**Verify:** render a card statically; hover shows the green outline cue.

---

## Step 4 — `CardDeck` + drag-to-slot (the core mechanic)

`src/components/work/CardDeck.tsx`:

- Arrange `ProjectCard`s mid-screen (absolute `left/top`, light fan/scatter).
- Port Hero's manual drag: on `mousedown` of a `.draggable` card, dispatch
  `new CustomEvent('element-drag')`, add `is-grabbed`, track pointer offset, move via
  `left/top` on `mousemove`, release on `mouseup`.
- **Hit-test the slot:** on `mouseup`, if the card's center is within the Player slot's
  rect → call `onDrop(project)` (passed from `WorkPlayer`). Otherwise spring the card
  back to its deck origin (reuse a small spring like Hero's `runSpring`, or animate `left/top`).
- While dragging near the slot, toggle a "slot-armed" visual (callback up to slot).

**Edge cases:**
- Cancel/return card if released outside slot.
- Guard against starting a drag during boot.
- Desktop-only; deck is not mounted on mobile (Step 9 handles mobile).

**Verify:** drag a card around; releasing over the slot fires `onDrop` (console.log);
releasing elsewhere returns the card.

---

## Step 5 — `PlayerSlot` (slot + dock + tray + eject)

`src/components/work/PlayerSlot.tsx`:

- **State 1 variant:** empty glowing slot bottom-right, `DROP TO PLAY` label; reacts to
  the "slot-armed" flag (intensify glow / magnet hint).
- **State 2 variant (dock):** compact bar bottom-right: `NOW PLAYING — <title>` + an
  **Eject** button (calls `onEject`). Plus the **tray**: remaining projects as a small
  stacked row of `ProjectCard`s.
- **Swap:** picking a tray card opens the slot tab (re-show drop target); dragging it in
  reuses the Step 4 drop path. Current project ejects first (animate its card back to
  tray), then boot the new one.

**Verify:** dock shows correct title; Eject calls back; tray lists the other projects.

---

## Step 6 — `BootSequence`

`src/components/work/BootSequence.tsx`:

- Overlay that plays a ~700–1000ms scanline / power-on flicker over the incoming hero,
  then resolves (calls `onComplete`).
- Drive with rAF or CSS keyframes (match the codebase's imperative-animation style;
  Framer Motion is available if cleaner).
- Dispatch Rafi cursor labels during boot: set `loading...` then `there we go` (extend
  `CustomCursor` `LABELS` with a `boot`/`load` set, or dispatch a new window event the
  cursor listens for — keep consistent with existing `element-drag` pattern).

**Verify:** trigger boot manually; animation plays once and calls `onComplete`; Rafi
label updates.

---

## Step 7 — `ProjectCanvas` + `CanvasFrame` (Figma-canvas detail)

`src/components/work/ProjectCanvas.tsx`:

- Vertical scroll container; dotted/grid canvas background (reuse `/work` grid pattern).
- Maps `activeProject.frames` → `<CanvasFrame />` stacked top→bottom.

`src/components/work/CanvasFrame.tsx`:

- Bordered artboard panel with a **frame-name label floating top-left** (match
  `SelectionOverlay` label style: green pill, dark text).
- On click, set `selectionStore` bounds to the frame's rect with a stable `id` so the
  selection chrome draws a bounding box around it. Give the frame `role="button"` (hover
  cue) and a unique id.

**Verify:** detail scrolls; frames show name labels; clicking a frame draws a selection box.

---

## Step 8 — Selection chrome scoping (required dependency for Step 7)

The selection visuals are currently home-only via `HomeOnlyLayer`.

- Decide and implement ONE of:
  - **(Recommended)** Extend the gate so `SelectionOverlay` + `SelectionBox` also render
    when `pathname.startsWith('/work')`; OR
  - Mount Work-local instances inside `ProjectCanvas`.
- `SelectionOverlay.ELEMENT_NAMES` is hero-specific. Generalise it: when the selected id
  isn't in `ELEMENT_NAMES`, fall back to a label carried on the selection payload (e.g.
  add an optional `label` to `SelectionBounds`) or to the frame name. Avoid breaking the
  hero's existing labels.

**Verify:** home page selection labels still work; Work frames get a selection box +
frame-name label; no double-rendering of overlays.

---

## Step 9 — Mobile fallback

`src/components/work/WorkMobile.tsx` (rendered by `WorkPlayer` when `< md` /
`pointer: coarse`):

- Vertical list of cards; tap opens that project's detail (reuse `ProjectCanvas`, but
  static — no draggable frames / no ruler dependency required).
- A **Back** button returns to the list.
- Match the Hero precedent: desktop interactive, mobile static. Use the same media-query
  approach already in the codebase (`(pointer: coarse)` / Tailwind `md:`).

**Verify:** in a mobile viewport, list renders, tap opens detail, Back returns; no drag
artifacts.

---

## Step 10 — `WorkPlayer` wiring (assemble)

`src/components/work/WorkPlayer.tsx`:

- Owns `const [activeProject, setActiveProject] = useState<Project | null>(null)` and a
  transient `booting` flag.
- Renders: `CardDeck` (when no active project) / `ProjectCanvas` (when active), always
  `PlayerSlot`, and `BootSequence` during boot.
- `onDrop(project)` → set `booting` → play `BootSequence` → on complete set
  `activeProject` and clear deck.
- `onEject()` → clear `activeProject`, re-deal deck (reset card positions).
- Swap path reuses `onDrop` with eject-first.
- Branch to `WorkMobile` on touch/small screens.

**Verify (full flow):** deck → drag to slot → boot → canvas detail → swap via tray →
eject → back to deck. No console errors.

---

## Step 11 — Polish & regression pass

- Rafi cursor labels feel right during drag/boot/swap.
- Slot magnet/arm feedback is legible.
- Eject re-deal looks clean.
- Confirm home page, page transitions, ruler, and idle-Rafi are unaffected.
- `npm run build` + lint clean.
- Run the app and click through (use the `run` skill / localhost) — verify by behaviour,
  not just compile.

---

## Risks / watch-outs

- **Drag coordinate model:** Hero positions `.draggable` via `left/top` px relative to a
  container after measuring `getBoundingClientRect`. Reuse that exact approach; don't mix
  transforms and left/top (Hero deliberately clears translate on grab).
- **`SelectionBox` marquee** bails when `.is-grabbed` exists — keep using `is-grabbed`
  during card drag so the marquee doesn't fight the card drag.
- **HomeOnlyLayer change** must not regress hero selection labels — test both pages.
- **Touch:** ensure deck/drag code is never mounted on touch (matches Hero's early return
  on `(pointer: coarse)`).
- **Modified Next.js:** verify `'use client'`, file colocation, and any metadata usage
  against `node_modules/next/dist/docs/` rather than memory.

---

## Suggested build order (incremental, each independently verifiable)

1. Step 1 (data) → 2 (shell)
2. Step 3 (card) → 4 (deck + drag + drop console.log)
3. Step 5 (slot/dock/tray) → 10 partial (wire onDrop/onEject with a stub detail)
4. Step 6 (boot)
5. Step 7 + 8 (canvas + selection scoping)
6. Step 9 (mobile)
7. Step 10 full wiring → 11 polish
