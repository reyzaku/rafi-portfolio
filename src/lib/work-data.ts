export type Frame = {
  name: string
  body?: string
  images?: string[]
}

export type Project = {
  id: string
  title: string
  year: string
  tags: string[]
  accent: string      // card top-strip / thumbnail accent colour
  thumbnail?: string  // optional preview image path
  frames: Frame[]
}

export const PROJECTS: Project[] = [
  {
    id: 'gomobile',
    title: 'Go Mobile Indonesia',
    year: '2023–Now',
    tags: ['HTML5', 'Motion', 'Web', 'Graphic'],
    accent: '#5CFF85',
    frames: [
      { name: 'Overview',    body: 'Design & motion work at Go Mobile Indonesia — spanning HTML5 ad banners, web graphics, and digital campaigns.' },
      { name: 'HTML5 Banners', body: 'Interactive and animated ad units built in HTML5/CSS/JS for programmatic delivery across GDN and DV360.' },
      { name: 'Motion',      body: 'Kinetic typography and animated brand assets for social and digital out-of-home.' },
      { name: 'Web',         body: 'Landing pages, microsite builds, and UI components for campaign-specific web properties.' },
      { name: 'Graphic',     body: 'Key visuals, digital illustrations, and print-ready artwork across multiple client brands.' },
    ],
  },
  {
    id: 'tanatara',
    title: 'Sinarmas Land — Tanatara',
    year: '2024',
    tags: ['Banner Design', 'Figma'],
    accent: '#7BB3FF',
    frames: [
      { name: 'Overview',  body: 'Visual communication for Tanatara — a premium residential development by Sinarmas Land.' },
      { name: 'Banners',   body: 'Full-suite digital banner system: static and animated variants across all IAB standard sizes.' },
      { name: 'Figma',     body: 'Design system and reusable component library built in Figma for the campaign team.' },
    ],
  },
  {
    id: 'camel-lime',
    title: 'Camel Ice Lime Sensation',
    year: '2024',
    tags: ['HTML5 Banner', 'GSAP', 'DV360'],
    accent: '#BFFF4A',
    frames: [
      { name: 'Overview',   body: 'Rich-media HTML5 campaign for the Camel Ice Lime Sensation product launch.' },
      { name: 'Animation',  body: 'GSAP-powered timeline animations — product reveal, flavour burst, CTA sequence.' },
      { name: 'DV360',      body: 'Delivered via Display & Video 360 with custom click-tracking and impression pixels.' },
      { name: 'Sizes',      body: 'Leaderboard, MPU, half-page, interstitial — all responsive fallbacks included.' },
    ],
  },
  {
    id: 'yodeck',
    title: 'Yodeck Signage Tracker',
    year: '2024',
    tags: ['Web App', 'React', 'Figma'],
    accent: '#FF9F43',
    frames: [
      { name: 'Overview',   body: 'Internal web application for tracking digital signage screen health and content schedules.' },
      { name: 'Design',     body: 'Full UX/UI design in Figma — information architecture, wireframes, high-fidelity screens.' },
      { name: 'React',      body: 'Frontend implementation in React with real-time status updates and filter/search.' },
      { name: 'Dashboard',  body: 'Summary view: screen count, uptime metrics, schedule conflicts, alert system.' },
    ],
  },
  {
    id: 'portfolio',
    title: 'Personal Portfolio',
    year: '2025',
    tags: ['Next.js', 'Framer Motion', 'Design'],
    accent: '#C084FC',
    frames: [
      { name: 'Overview',   body: 'This portfolio — designed and built from scratch as a living design artefact.' },
      { name: 'Design',     body: 'Figma-first process: motion language, type scale, component library, dark canvas aesthetic.' },
      { name: 'Tech',       body: 'Next.js App Router, Tailwind v4, custom cursor system, page transitions, Figma-canvas work player.' },
      { name: 'Details',    body: 'Flow-field hero, draggable interaction layer, global ruler, per-page scroll containers.' },
    ],
  },
]
