import type { Province } from "@/types"

import { stAugustineProvince } from "./africa/st-augustine"
import { stJosephProvince } from "./africa/st-joseph"
import { congoProvince } from "./africa/dr-congo"
import { southAfricaProvince } from "./africa/south-africa"
import { equatorialAfricaProvince } from "./africa/equatorial-africa"

export const africanProvinces: Province[] = [
  stAugustineProvince,
  stJosephProvince,
  congoProvince,
  southAfricaProvince,
  equatorialAfricaProvince,
]
