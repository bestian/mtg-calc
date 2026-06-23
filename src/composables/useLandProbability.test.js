import { describe, it, expect } from 'vitest'
import { useLandProbability } from './useLandProbability.js'

describe('useLandProbability', () => {
  it('defaults to 40-card deck with 17 lands', () => {
    const { deckSize, landCount } = useLandProbability()
    expect(deckSize.value).toBe(40)
    expect(landCount.value).toBe(17)
  })

  it('nonlandCount is derived reactively', () => {
    const { deckSize, landCount, nonlandCount } = useLandProbability()
    deckSize.value = 60
    landCount.value = 24
    expect(nonlandCount.value).toBe(36)
  })

  it('landMatrix has shape [5][12]', () => {
    const { landMatrix } = useLandProbability()
    expect(landMatrix.value).toHaveLength(5)
    for (const row of landMatrix.value) expect(row).toHaveLength(12)
  })

  it('landMatrix rows sum to 1 when valid', () => {
    const { landMatrix } = useLandProbability()
    for (const row of landMatrix.value) {
      expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10)
    }
  })

  it('isValid is false when landCount > deckSize', () => {
    const { deckSize, landCount, isValid } = useLandProbability()
    deckSize.value = 40
    landCount.value = 41
    expect(isValid.value).toBe(false)
  })

  it('isValid is false when deckSize < 7', () => {
    const { deckSize, isValid } = useLandProbability()
    deckSize.value = 6
    expect(isValid.value).toBe(false)
  })

  it('landMatrix is all zeros when invalid', () => {
    const { deckSize, landCount, landMatrix } = useLandProbability()
    deckSize.value = 40
    landCount.value = 41
    for (const row of landMatrix.value) {
      expect(row.every(p => p === 0)).toBe(true)
    }
  })
})
