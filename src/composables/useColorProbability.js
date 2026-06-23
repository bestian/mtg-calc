import { ref, computed } from 'vue'
import { buildMatrix } from '../math/hypergeometric.js'

const COLORS = ['B', 'W', 'U', 'G', 'R']

function parseMana(raw) {
  if (!raw || !raw.trim()) return null
  const str = raw.trim().toUpperCase()
  const match = str.match(/^(\d*)([BWUGR]*)$/)
  if (!match) return null
  const generic = match[1] ? parseInt(match[1], 10) : 0
  const pipStr = match[2] ?? ''
  if (generic === 0 && pipStr.length === 0) return null
  const pips = {}
  for (const ch of pipStr) pips[ch] = (pips[ch] ?? 0) + 1
  return { cmc: generic + pipStr.length, pips }
}

function cumulativeGeq(row, minK) {
  let sum = 0
  for (let k = minK; k < row.length; k++) sum += row[k]
  return Math.min(1, sum)
}

/**
 * @param {Ref<number>} deckSize
 * @param {ComputedRef<number[][]>} landMatrix - from useLandProbability, for P(total lands >= CMC)
 */
export function useColorProbability(deckSize, landMatrix) {
  const playFirst = ref(true)
  const colorCounts = ref({ B: 0, W: 0, U: 0, G: 0, R: 0 })
  const manaCost = ref('')

  const parsedCost = computed(() => parseMana(manaCost.value))

  const colorMatrix = computed(() => {
    const result = {}
    for (const color of COLORS) {
      const count = colorCounts.value[color]
      if (count > 0) result[color] = buildMatrix(deckSize.value, count)
    }
    return result
  })

  const castability = computed(() => {
    const cost = parsedCost.value
    if (!cost) return null
    const { cmc, pips } = cost
    return landMatrix.value.map((landRow, i) => {
      const maxMana = playFirst.value ? i + 1 : i
      if (cmc > maxMana) return 0

      const pLands = cumulativeGeq(landRow, cmc)
      const pColors = Object.entries(pips).reduce((acc, [color, req]) => {
        const cRow = colorMatrix.value[color]?.[i]
        if (!cRow) return 0
        return acc * cumulativeGeq(cRow, req)
      }, 1)
      return pLands * pColors
    })
  })

  return { playFirst, colorCounts, manaCost, parsedCost, colorMatrix, castability }
}
