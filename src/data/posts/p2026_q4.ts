// October to December 2026 · the first season.
// Same three themes as the last quarter of 2027, with the copy moved one day
// so that each series lands on the same weekday (4 Oct 2027 and 5 Oct 2026
// are both Mondays). Holiday-specific days are rewritten below.
import { posts as oct } from './p2027_10'
import { posts as nov } from './p2027_11'
import { posts as dec } from './p2027_12'

function shiftBack(date: string): string {
  // 2027-MM-DD + 1 day, in 2026
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  d.setUTCFullYear(2026)
  return d.toISOString().slice(0, 10)
}

const overrides: Record<string, string> = {
  '2026-10-01': `Welcome to the table. Over the coming weeks, I will share one idea on Mondays, a line to keep on Tuesdays, a check-in on Wednesdays, something useful on Thursdays, and a place to gather on Fridays. Weekends are for the kitchen, the writing desk, and a little time for yourself. If you would like personal support along the way, a free introductory conversation about one-to-one coaching is always open through my profile.`,
  '2026-10-02': `Welcome to the Friday Table. This is where we will gather each week to reflect, not to perform. No reinvention required. What would you welcome more of this autumn: ease, honesty, tenderness, or curiosity? Your answer can stay just with you.`,
  '2026-10-03': `Soup season, no self-improvement attached. Soften an onion in olive oil, add the vegetables you have, cover with stock, simmer until tender, then blend and season. Eat it because it tastes good. On Monday, we begin with the masks we wear in love.`,
  '2026-10-04': `No starting gun today. Choose one word for how you would like these last months of the year to feel, not what you need to achieve. Tomorrow, October begins with the difference between being polished and being known.`,
  '2026-11-01': `The morning after Halloween: you can take off the costume and keep your privacy. Tomorrow, we begin November by noticing the small acts that make everyday life feel a little more cared for.`,
  '2026-12-24': `For Christmas Eve, a simple sentence: “It is lovely to see you; I am not hugging today.” For a different kind of chosen connection, explore the Flavours of Desire mini-course. A sensory evening is an invitation, never an obligation to continue into sex.`,
  '2026-12-25': `The Friday Table, Christmas Day edition: Where did you make a little room for yourself this week? One word is enough. There is no need to turn today into a public reflection exercise.`,
  '2026-12-26': `A little less perfect. A little more present. Whether today holds leftovers, a full table, work, solitude, or mixed feelings, you do not have to perform the expected version. May there be one moment that feels genuinely yours.`,
  '2026-12-27': `Something for yourself: A slow drink, a little fresh air, a comfortable seat, or a conversation you actually want. Choose one small kindness. This week, we close the year without asking you to become a different person by New Year’s Eve.`,
  '2026-12-31': `Keep these questions for the year ahead: “What feels more like me now? What do I want to make room for next? What support would be useful?” Thank you for making room for this conversation since October. Here is to more choice, more honesty, and connection that feels like your own. To explore your next steps in love, intimacy, or body connection, book an introductory conversation about working with me one-to-one.`,
}

const shifted: [string, string][] = [...oct, ...nov, ...dec]
  .filter(([date]) => date >= '2027-10-04' && date <= '2027-12-30')
  .map(([date, body]) => [shiftBack(date), body] as [string, string])

const welcome: [string, string][] = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'].map(
  (d) => [d, overrides[d]] as [string, string],
)

export const posts: [string, string][] = [...welcome, ...shifted].map(([date, body]) => [
  date,
  overrides[date] ?? body,
])
