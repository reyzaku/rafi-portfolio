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
  accent: string   // card top-strip colour
  frames: Frame[]
}

export const PROJECTS: Project[] = [
  {
    id: 'kopi-nusantara',
    title: 'Kopi Nusantara',
    year: '2024',
    tags: ['Branding', 'Print'],
    accent: '#5CFF85',
    frames: [
      { name: 'Overview',  body: 'Full brand identity for Kopi Nusantara — a specialty coffee chain rooted in Indonesian heritage.' },
      { name: 'Strategy',  body: 'Positioning brief, target audience, competitive landscape.' },
      { name: 'Identity',  body: 'Wordmark, color palette, typographic system.' },
      { name: 'Collateral', body: 'Packaging, cups, paper bags, business cards, signage.' },
      { name: 'Outcome',   body: 'Launched across 12 outlets in Jakarta, June 2024.' },
    ],
  },
  {
    id: 'motion-reel',
    title: 'Motion Reel Q3',
    year: '2024',
    tags: ['Motion', 'After Effects'],
    accent: '#FFD700',
    frames: [
      { name: 'Overview',  body: 'Compiled motion reel showcasing broadcast graphics, kinetic type, and UI transitions.' },
      { name: 'Process',   body: 'Breakdown of the composition and timing approach.' },
      { name: 'Highlights', body: 'Key sequences: logo reveals, lower-thirds, full-screen IDs.' },
      { name: 'Deliverables', body: '4K H.264 master + web-optimised export.' },
    ],
  },
  {
    id: 'archipelago',
    title: 'Archipelago Mag',
    year: '2024',
    tags: ['Editorial', 'Typography'],
    accent: '#FF85A1',
    frames: [
      { name: 'Overview',  body: 'Editorial design for a quarterly magazine celebrating Indonesian arts and culture.' },
      { name: 'Grid System', body: '12-column grid, baseline rhythm, margin strategy.' },
      { name: 'Typography', body: 'Custom type pairing: Canela for display, Suisse Int\'l for body.' },
      { name: 'Layouts',   body: 'Feature spreads, pull-quotes, infographics.' },
      { name: 'Print Specs', body: '210×297mm, 96pp, CMYK + Pantone 485.' },
    ],
  },
  {
    id: 'sari-organik',
    title: 'Sari Organik',
    year: '2023',
    tags: ['Packaging', 'Illustration'],
    accent: '#A8FFD4',
    frames: [
      { name: 'Overview',    body: 'Packaging redesign for Sari Organik, an Indonesian organic skincare brand.' },
      { name: 'Illustration', body: 'Hand-drawn botanical illustrations — 14 unique species.' },
      { name: 'Packaging',   body: 'Bottle, jar, tube, and outer-box dielines.' },
      { name: 'Materials',   body: 'Uncoated FSC paper, soy inks, embossing on the outer box.' },
    ],
  },
  {
    id: 'title-sequence',
    title: 'Short Film Titles',
    year: '2023',
    tags: ['Motion', 'Film'],
    accent: '#85D1FF',
    frames: [
      { name: 'Overview',   body: 'Title sequence for "Arus Balik" — a 20-minute Indonesian short film.' },
      { name: 'Concept',    body: 'Water and migration as the visual metaphor; ink-in-water particles.' },
      { name: 'Animation',  body: 'After Effects + Cinema 4D fluid simulation, 2 min 15 sec.' },
      { name: 'Sound',      body: 'Timed to an original gamelan-electronic score.' },
    ],
  },
  {
    id: 'studio-langit',
    title: 'Studio Langit',
    year: '2023',
    tags: ['Branding', 'Identity'],
    accent: '#FF9F43',
    frames: [
      { name: 'Overview',  body: 'Visual identity for Studio Langit, a Jakarta-based architecture and interiors studio.' },
      { name: 'Logotype',  body: 'Custom wordmark construction — geometry derived from skyline silhouettes.' },
      { name: 'System',    body: 'Business stationery, email signature, site headers, social templates.' },
      { name: 'Tone',      body: 'Restrained palette: bone, charcoal, one warm amber accent.' },
    ],
  },
  {
    id: 'jakarta-design',
    title: 'Jakarta Design Week',
    year: '2022',
    tags: ['Campaign', 'Print'],
    accent: '#FF6B6B',
    frames: [
      { name: 'Overview',   body: 'Campaign identity for Jakarta Design Week 2022 — "Gerak" (Movement) theme.' },
      { name: 'Key Visual', body: 'Optical-flow typography system; letters constructed from motion blur stills.' },
      { name: 'OOH',        body: 'Billboard, transit ads, wayfinding signage across 6 city venues.' },
      { name: 'Digital',    body: 'Animated social content, email headers, website banners.' },
    ],
  },
  {
    id: 'bumi-coffee',
    title: 'Bumi Coffee',
    year: '2022',
    tags: ['Social', 'Branding'],
    accent: '#C8A97E',
    frames: [
      { name: 'Overview',    body: 'Full social media kit for Bumi Coffee, a specialty roaster from Flores.' },
      { name: 'Templates',   body: '24 reusable Instagram and TikTok templates — story, feed, reel cover.' },
      { name: 'Photography', body: 'Art direction brief for product and lifestyle photography.' },
      { name: 'Copy voice',  body: 'Tone-of-voice guide: warm, direct, origin-proud.' },
    ],
  },
]
