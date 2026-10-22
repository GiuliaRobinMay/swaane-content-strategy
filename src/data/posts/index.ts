import type { PostSeed } from '../types'
import { posts as q4 } from './p2026_q4'
import { posts as m01 } from './p2027_01'
import { posts as m02 } from './p2027_02'
import { posts as m03 } from './p2027_03'
import { posts as m04 } from './p2027_04'
import { posts as m05 } from './p2027_05'
import { posts as m06 } from './p2027_06'
import { posts as m07 } from './p2027_07'
import { posts as m08 } from './p2027_08'
import { posts as m09 } from './p2027_09'
import { posts as m10 } from './p2027_10'
import { posts as m11 } from './p2027_11'
import { posts as m12 } from './p2027_12'

const all: [string, string][] = [
  ...q4, ...m01, ...m02, ...m03, ...m04, ...m05, ...m06, ...m07, ...m08, ...m09, ...m10, ...m11, ...m12,
]

export const seeds: PostSeed[] = all
  .map(([date, body]) => ({ date, body }))
  .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))

export const seedByDate: Map<string, PostSeed> = new Map(seeds.map((s) => [s.date, s]))
