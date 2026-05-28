'use client'

import { usePathname } from 'next/navigation'
import SelectionBox from './SelectionBox'
import SelectionOverlay from './SelectionOverlay'
import Ruler from '../ui/Ruler'

// Figma-style editing tools — home page only
export default function HomeOnlyLayer() {
  const pathname = usePathname()
  if (pathname !== '/') return null

  return (
    <>
      <Ruler />
      <SelectionOverlay />
      <SelectionBox />
    </>
  )
}
