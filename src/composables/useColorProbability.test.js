import { describe, it, expect } from 'vitest'
import { ref, computed } from 'vue'
import { useColorProbability } from './useColorProbability.js'
import { buildMatrix } from '../math/hypergeometric.js'

function make(deckSizeVal = 40, landCountVal = 17) {
  const deckSize = ref(deckSizeVal)
  const landMatrix = computed(() => buildMatrix(deckSizeVal, landCountVal))
  return useColorProbability(deckSize, landMatrix)
}

describe('mana cost parsing', () => {
  it('"2GG" → { cmc: 4, pips: { G: 2 } }', () => {
    const { manaCost, parsedCost } = make()
    manaCost.value = '2GG'
    expect(parsedCost.value).toEqual({ cmc: 4, pips: { G: 2 } })
  })

  it('"UB" → { cmc: 2, pips: { U: 1, B: 1 } }', () => {
    const { manaCost, parsedCost } = make()
    manaCost.value = 'UB'
    expect(parsedCost.value).toEqual({ cmc: 2, pips: { U: 1, B: 1 } })
  })

  it('"5GG" → { cmc: 7, pips: { G: 2 } }', () => {
    const { manaCost, parsedCost } = make()
    manaCost.value = '5GG'
    expect(parsedCost.value).toEqual({ cmc: 7, pips: { G: 2 } })
  })

  it('empty string → null', () => {
    const { parsedCost } = make()
    expect(parsedCost.value).toBeNull()
  })

  it('"XZ" → null (invalid symbols)', () => {
    const { manaCost, parsedCost } = make()
    manaCost.value = 'XZ'
    expect(parsedCost.value).toBeNull()
  })
})

describe('colorMatrix', () => {
  it('only includes colours with count > 0', () => {
    const { colorCounts, colorMatrix } = make()
    colorCounts.value = { B: 0, W: 0, U: 0, G: 10, R: 7 }
    expect(Object.keys(colorMatrix.value).sort()).toEqual(['G', 'R'])
  })

  it('each colour matrix has shape [5][12]', () => {
    const { colorCounts, colorMatrix } = make()
    colorCounts.value = { B: 0, W: 0, U: 0, G: 10, R: 0 }
    expect(colorMatrix.value.G).toHaveLength(5)
    expect(colorMatrix.value.G[0]).toHaveLength(12)
  })
})

describe('castability', () => {
  it('is null when manaCost is empty', () => {
    expect(make().castability.value).toBeNull()
  })

  it('values are in [0, 1]', () => {
    const { colorCounts, manaCost, castability } = make()
    colorCounts.value = { B: 0, W: 0, U: 0, G: 10, R: 0 }
    manaCost.value = '1G'
    expect(castability.value).toHaveLength(5)
    for (const p of castability.value) {
      expect(p).toBeGreaterThanOrEqual(0)
      expect(p).toBeLessThanOrEqual(1)
    }
  })

  it('turn-drop gate: "5GG" (CMC 7) is uncastable in all 5 displayed rounds', () => {
    const { colorCounts, manaCost, castability } = make(40, 17)
    colorCounts.value = { B: 0, W: 0, U: 0, G: 10, R: 0 }
    manaCost.value = '5GG'
    expect(castability.value).toEqual([0, 0, 0, 0, 0])
  })

  it('play first: CMC 3 spell is gated until round index 2', () => {
    const { colorCounts, manaCost, castability, playFirst } = make(40, 17)
    playFirst.value = true
    colorCounts.value = { B: 0, W: 0, U: 0, G: 10, R: 0 }
    manaCost.value = '2G'
    expect(castability.value[0]).toBe(0)
    expect(castability.value[1]).toBe(0)
    expect(castability.value[2]).toBeGreaterThan(0)
  })

  it('draw first: CMC 3 spell is gated until round index 3', () => {
    const { colorCounts, manaCost, castability, playFirst } = make(40, 17)
    playFirst.value = false
    colorCounts.value = { B: 0, W: 0, U: 0, G: 10, R: 0 }
    manaCost.value = '2G'
    expect(castability.value[0]).toBe(0)
    expect(castability.value[1]).toBe(0)
    expect(castability.value[2]).toBe(0)
    expect(castability.value[3]).toBeGreaterThan(0)
  })
})
