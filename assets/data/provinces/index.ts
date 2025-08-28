import type { Province } from "@/types"

import { africanProvinces } from "./africa"
import { americanProvinces } from "./americas"
import { asiaPacificProvinces } from "./asia-pacific"
import { oceaniaProvinces } from "./oceania"
import { europeanProvinces } from "./europe"

export const allProvinces: Province[] = [
  ...africanProvinces,
  ...americanProvinces,
  ...asiaPacificProvinces,
  ...oceaniaProvinces,
  ...europeanProvinces,
]
