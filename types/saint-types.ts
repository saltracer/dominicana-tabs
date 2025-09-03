import { CelebrationRank } from "./celebrations-types"
import { LiturgicalColor } from "./liturgical-types"

export interface Saint {
  id: string
  name: string
  feast_day: string
  short_bio?: string
  biography?: string[]
  image_url?: string
  patronage?: string
  birth_year?: number
  death_year?: number
  prayers?: string
  is_dominican: boolean
  is_doctor?: boolean
  rank?: CelebrationRank
  color?: LiturgicalColor
  proper?: string
  type?: "universal" | "dominican" | "both"
  books?: any[]
  canonization_date?: string
  birth_place?: string
  death_place?: string
  quotes?: string[]
}
