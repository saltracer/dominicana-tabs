import type { LiturgicalColor } from "./liturgical-types"

export enum CelebrationRank {
  SOLEMNITY = "Solemnity",
  FEAST = "Feast",
  MEMORIAL = "Memorial",
  OPTIONAL_MEMORIAL = "Optional Memorial",
  FERIAL = "Ferial",
}

// Define the interface for a fixed celebration (feast, solemnity, etc.)
export interface FixedCelebration {
  id: string
  name: string
  date: string // Format: "MM-DD"
  rank: CelebrationRank
  color: LiturgicalColor
  proper?: string
  readings?: string
  type: "universal" | "dominican" | "both"
  isSaint?: boolean
  short_desc?: string // Short description (1-2 sentences)
  description?: string[] // Longer description (paragraph)
  book_recommendation?: any
}

export interface Celebration {
  id: string
  name: string
  date: string
  rank: CelebrationRank
  color: string
  isDominican: boolean
  description?: string[]
  // Add these new fields
  birthYear?: number
  deathYear?: number
  patronage?: string
  biography?: string[]
  prayers?: string
  books?: string[]
}