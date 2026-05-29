'use client'

import Nav from '@/components/layout/Nav'

const PROJECTS = [
  { id: '01', title: 'Brand Identity — Kopi Nusantara',   year: '2024', tags: ['Branding', 'Print']          },
  { id: '02', title: 'Motion Reel — Q3 2024',             year: '2024', tags: ['Motion', 'After Effects']    },
  { id: '03', title: 'Editorial — Archipelago Magazine',  year: '2024', tags: ['Editorial', 'Typography']    },
  { id: '04', title: 'Packaging — Sari Organik',          year: '2023', tags: ['Packaging', 'Illustration']  },
  { id: '05', title: 'Title Sequence — Short Film',       year: '2023', tags: ['Motion', 'Film']             },
  { id: '06', title: 'Visual Identity — Studio Langit',   year: '2023', tags: ['Branding', 'Identity']       },
  { id: '07', title: 'Campaign — Jakarta Design Week',    year: '2022', tags: ['Campaign', 'Print']          },
  { id: '08', title: 'Social Kit — Bumi Coffee',          year: '2022', tags: ['Social', 'Branding']         },
]

export default function Work() {
  return (
    <main className="relative w-full min-h-screen">
      {/* Background — fixed so it stays full screen while content scrolls */}
      <div className="fixed inset-0 z-0 bg-cover bg-top" style={{ backgroundImage: "url('/bg.webp')" }} />
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.008) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.008) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      <Nav />

      <div className="relative z-10 pt-[140px] pb-[100px] px-[50px] max-w-[1200px] mx-auto">

        {/* Header */}
        <div className="mb-[80px]">
          <p style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '6px',
            color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 16,
          }}>Selected Work</p>
          <h1 style={{
            fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 700,
            letterSpacing: '-0.04em', color: '#fff', lineHeight: 1,
          }}>My Work</h1>
        </div>

        {/* Project list */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {PROJECTS.map((p) => (
            <div key={p.id} role="button" style={{
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '32px 0',
              display: 'flex', alignItems: 'center', gap: 24,
            }}>
              <span style={{
                fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.25)',
                letterSpacing: '2px', minWidth: 28,
              }}>{p.id}</span>

              <h2 style={{
                flex: 1, fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 600,
                letterSpacing: '-0.02em', color: '#fff',
              }}>{p.title}</h2>

              <div style={{ display: 'flex', gap: 8 }}>
                {p.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: '1px',
                    color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                    border: '1px solid rgba(255,255,255,0.12)',
                    padding: '4px 10px', borderRadius: 100,
                  }}>{tag}</span>
                ))}
              </div>

              <span style={{
                fontSize: 13, color: 'rgba(255,255,255,0.25)', minWidth: 40, textAlign: 'right',
              }}>{p.year}</span>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p style={{
          marginTop: 60, fontSize: 13, color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.02em',
        }}>
          More projects available on request.
        </p>
      </div>
    </main>
  )
}
