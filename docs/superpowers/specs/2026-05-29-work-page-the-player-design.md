# Work Page — "The Player" — Design Spec

Date: 2026-05-29
Status: Approved by Rafi (design), ready for implementation plan
Route: `/work`

---

## 1. Concept

`/work` is not a gallery you scroll — it is a **machine you operate**. Projects are
**cards** (like DVDs / cartridges / hard-disks). There is a **Player slot**. You
**drag a card into the slot** and the project **boots up**. This is the signature,
one-of-a-kind interaction of the portfolio.

It closes the loop on the site's core concept — **"Rafi is present in the browser as
the cursor."** The whole site is a live Figma file; Rafi lives in it. The Work page
extends that: the site is a device, Rafi is inside it, and you operate it to see his
work.

The project detail that boots up is itself laid out to **imitate a Figma canvas**
(frames/artboards, ruler, selection chrome, multiplayer cursor) — but navigated by
**normal vertical scroll** (NO pan/zoom, NO scroll-trigger choreography).

---

## 2. State Machine

The Work page has two primary modes, driven by a single piece of React state:
`activeProject: Project | null`.

### State 1 — DECK (`activeProject === null`)
- Project cards are arranged in the **middle** of the screen (fanned / lightly
  scattered, draggable).
- An empty **Player slot** sits **bottom-right**, glowing faintly, labelled e.g.
  `DROP TO PLAY`.
- Hovering a card lifts it slightly (reuses the global `.draggable` hover-outline cue).
- Dragging a card toward the slot makes the slot react (glow intensifies / magnet pull).
- Rafi cursor reacts via existing custom events (`element-drag`) → label e.g. `"this one?"`.

### Transition — BOOT
- On valid drop (card released over the slot hit-area), the card **seats** into the slot
  with a click/snap.
- A short **boot animation** plays (scanline / power-on flicker over the incoming hero).
  Target duration ~700–1000ms.
- Rafi cursor label sequence: `"loading..."` → `"there we go"`.
- The middle deck **clears out** (cards fly down / fade).
- `activeProject` is set → render State 2.

### State 2 — PLAYING (`activeProject !== null`)
- The project detail renders as a **scrolling Figma canvas** (see §4).
- The Player **collapses to a compact dock** (bottom-right): shows
  `NOW PLAYING — <project title>` and an **Eject** button.
- The **remaining projects** appear as a **card stack at the bottom** (the tray).

### Swap (within State 2)
- One project plays at a time (single-disc behaviour).
- User picks a card from the bottom stack → the dock's **slot tab re-opens** → user
  drags the new card in.
- On drop: current project **ejects** (its card animates back into the stack) → new
  card boots (BOOT transition) → `activeProject` updates.

### Eject (return to State 1)
- The dock's **Eject** button clears the Player, **re-deals the deck**, and returns to
  State 1. The visitor is never trapped in playing-mode.

### Mobile (`pointer: coarse` / `< md`)
- The drag-to-slot metaphor is **not** used (drag-on-touch is unreliable).
- Cards render as a simple vertical list; **tap a card** opens its detail (still
  Figma-styled visually, but static — no draggable frames, no ruler chrome required).
- A simple **Back** button returns to the card list.
- This mirrors the existing pattern: Hero is desktop-drag, mobile gets a static layout.

---

## 3. Project Data Model

A single source-of-truth array (replaces the current placeholder `PROJECTS` in
`src/app/work/page.tsx`). Suggested shape:

```ts
type Frame = {
  name: string          // Figma frame label, e.g. "Hero", "The Brief", "Screens"
  // content descriptor — image(s) + optional caption/body
  images?: string[]     // /public paths
  body?: string
}

type Project = {
  id: string            // e.g. "gomobile"
  title: string         // "GoMobile"
  year: string
  tags: string[]
  cardColor?: string    // accent for the card face
  cover?: string        // card thumbnail
  frames: Frame[]       // the Figma-canvas sections, top → bottom
}
```

Real content/images are Rafi's to provide; the build ships with placeholder frames so
the mechanic is testable end-to-end.

---

## 4. Detail View — "Figma Canvas (scroll)"

The booted project renders as a vertically-scrolling page styled like a Figma file:

- **Background:** dotted/grid canvas (reuse the existing grid-overlay pattern already on
  `/work`).
- **Frames:** each `Frame` renders as an artboard — a bordered panel with a small
  **frame-name label floating at its top-left** (matching Figma's frame labels and the
  existing `SelectionOverlay` label styling: green pill, black text, monospace-ish).
- **Ruler:** the global `<Ruler />` already renders on every page — it stays, reinforcing
  the canvas feel. (Note: ruler currently tracks viewport coords; acceptable for v1.)
- **Selection:** clicking a frame shows a **SelectionBox / SelectionOverlay**-style
  bounding box. See §5 for the scoping decision this requires.
- **Cursor:** the global `awesome-guest` `<CustomCursor />` and Rafi reactions are
  already present and sell the "live file" feeling.
- **Scroll:** plain vertical scroll. Page already supports infinite-height content
  (fixed background + `min-h-screen`, established earlier this session).

---

## 5. Reuse & Required Changes to Existing Systems

The build should **reuse**, not reinvent, these existing primitives:

| System | File | Reuse for |
|---|---|---|
| Manual drag (left/top px, `.draggable`, `is-grabbed`) | `components/hero/Hero.tsx` | Card dragging on the deck |
| Selection store | `lib/selection-store.ts` | Frame selection bounds |
| Selection chrome | `components/ui/SelectionOverlay.tsx`, `SelectionBox.tsx` | Frame selection visuals |
| Ruler | `components/ui/Ruler.tsx` | Already global — no change |
| Rafi cursor reactions | `components/ui/CustomCursor.tsx` | `element-drag` etc. labels during card drag/boot |
| Page transition | `lib/page-transition.ts`, `components/ui/PageTransition.tsx` | (Unchanged — Work is one route; mode switches are in-page) |

**Required changes / decisions:**

1. **Selection chrome scoping.** `SelectionOverlay` + `SelectionBox` are currently
   rendered **home-only** via `HomeOnlyLayer` (returns null unless `pathname === '/'`).
   The Work detail wants frame-selection too. Decision for the plan: **scope these to
   also render on `/work`** (extend the gate to `'/' || startsWith('/work')`), OR render
   a Work-local instance. `SelectionOverlay`'s `ELEMENT_NAMES` map is hero-specific —
   frame labels for Work must be added (or the overlay generalised to read a label from
   the selection payload).

2. **`element-drag` reuse.** Card drag should dispatch the existing
   `element-drag` window event so the Rafi cursor reacts — but the deck's drag messages
   differ from hero's "stop moving my name" tone. New copy needed (loading/boot flavour),
   added to `CustomCursor`'s `LABELS` or a Work-local label set.

3. **Boot animation** is new (scanline/flicker). Self-contained component.

4. **No new routing.** Everything (deck ↔ playing) is in-page React state on `/work`.
   AGENTS.md warns this is a modified Next.js — **read `node_modules/next/dist/docs/`
   before touching any routing/`'use client'`/metadata concerns.**

---

## 6. Component Breakdown (proposed)

All under `src/components/work/` unless noted:

- `WorkPlayer.tsx` — top-level client component owning `activeProject` state + mode switch.
- `CardDeck.tsx` — State 1 arranged draggable cards.
- `ProjectCard.tsx` — a single draggable card (deck + tray + dock slot use the same card).
- `PlayerSlot.tsx` — the drop target; empty-slot (State 1) and collapsed-dock (State 2)
  visual variants + Eject + tray.
- `BootSequence.tsx` — scanline/power-on transition overlay.
- `ProjectCanvas.tsx` — State 2 Figma-canvas detail (renders `frames`).
- `CanvasFrame.tsx` — one artboard with frame-name label + selection wiring.
- `work-data.ts` (in `lib/` or `app/work/`) — the `Project[]` source of truth.
- Mobile fallback: `WorkMobile.tsx` (tap-to-open list + back).

`src/app/work/page.tsx` becomes a thin shell that renders `<WorkPlayer />` (+ existing
`<Nav />` and fixed background/grid).

---

## 7. Out of Scope (v1)

- Pan/zoom or scroll-trigger choreography (explicitly rejected).
- Real project content/images (placeholders ship; Rafi supplies real assets later).
- The guestbook / message-wall feature (separate, set-aside).
- About / Contact pages (planned separately at high level after Work).

---

## 8. Open Items for Rafi (non-blocking)

- Card visual style (DVD case? cartridge? floppy? flat Figma card?). Build ships a clean
  default; Rafi owns final aesthetic.
- Exact frame list per project.
- Whether the deck cards are pre-scattered or neatly fanned.
