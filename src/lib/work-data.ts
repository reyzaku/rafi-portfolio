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
    title: 'Gomobile Indonesia',
    year: '2023–Now',
    tags: ['Digital Marketing', 'HTML5', 'Graphic Design'],
    accent: '#5CFF85',
    frames: [
      { name: 'Overview',     body: 'Design, motion, and digital marketing work at Gomobile Indonesia — spanning HTML5 ad banners, campaign graphics, and brand assets.' },
      { name: 'Digital Marketing', body: 'Campaign concepts, social creatives, and performance-led visuals across multiple client brands.' },
      { name: 'HTML5',        body: 'Interactive and animated ad units built in HTML5/CSS/JS for programmatic delivery across GDN and DV360.' },
      { name: 'Graphic Design', body: 'Key visuals, digital illustrations, and print-ready artwork supporting each campaign.' },
    ],
  },
  {
    id: 'acaii',
    title: 'Acaii Tea & Dessert',
    year: '2024',
    tags: ['Motion Design', 'E-commerce', 'Graphic Design'],
    accent: '#5CFF85',
    frames: [
      { name: 'Overview',     body: 'Brand and storefront work for Acaii Tea & Dessert — from motion teasers to a full e-commerce presence.' },
      { name: 'Motion Design', body: 'Animated promos, menu reveals, and social motion assets to drive engagement.' },
      { name: 'E-commerce',   body: 'Online ordering storefront design — product cards, checkout flow, and promo modules.' },
      { name: 'Graphic Design', body: 'Menu artwork, packaging visuals, and seasonal campaign key visuals.' },
    ],
  },
  {
    id: 'banner-ads',
    title: 'Banner Advertising Design',
    year: '2024',
    tags: ['Static', 'Motion', 'HTML5'],
    accent: '#5CFF85',
    frames: [
      { name: 'Overview',  body: 'A collection of banner advertising work spanning static, motion, and rich-media HTML5 formats.' },
      { name: 'Static',    body: 'Clean, conversion-focused static banners across all IAB standard sizes.' },
      { name: 'Motion',    body: 'Animated banner sequences — product reveals, kinetic type, and CTA emphasis.' },
      { name: 'HTML5',     body: 'Rich-media HTML5 units with click tracking and impression pixels for programmatic delivery.' },
    ],
  },
  {
    id: 'ui-gallery',
    title: 'UI Design Gallery',
    year: '2025',
    tags: ['UI/UX', 'HTML+JS', 'UI Design'],
    accent: '#5CFF85',
    frames: [
      { name: 'Overview',  body: 'A gallery of UI design explorations — interfaces, components, and interactive prototypes.' },
      { name: 'UI/UX',     body: 'User flows, wireframes, and high-fidelity screens with a focus on usability.' },
      { name: 'HTML+JS',   body: 'Selected interfaces built out in HTML/CSS/JS as living, interactive prototypes.' },
      { name: 'UI Design', body: 'Component libraries, design systems, and polished visual interface work.' },
    ],
  },
]
