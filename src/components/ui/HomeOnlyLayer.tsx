'use client'

import { usePathname } from 'next/navigation'
import SelectionBox from './SelectionBox'
import SelectionOverlay from './SelectionOverlay'

// Figma-style editing tools — home page only
export default function HomeOnlyLayer() {
  const pathname = usePathname()
  if (pathname !== '/') return null

  return (
    <>
      <SelectionOverlay />
      <SelectionBox />
    </>
  )
}
