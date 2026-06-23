import { describe, it, expect } from 'vitest'
import { hypergeometric, buildMatrix } from './hypergeometric.js'

describe('hypergeometric', () => {
  it('returns 0 when k > K (impossible)', () => {
    expect(hypergeometric(40, 5, 7, 6)).toBe(0)
  })

  it('returns 0 when n-k > N-K (impossible)', () => {
    expect(hypergeometric(40, 38, 7, 0)).toBe(0)
  })

  it('all-success deck: P(7 of 7) = 1', () => {
    expect(hypergeometric(7, 7, 7, 7)).toBeCloseTo(1, 10)
  })

  it('zero-success deck: P(0 of 7) = 1', () => {
    expect(hypergeometric(7, 0, 7, 0)).toBeCloseTo(1, 10)
  })

  it('probabilities sum to 1 for 40-card deck, 17 lands, 7 drawn', () => {
    const sum = Array.from({ length: 8 }, (_, k) => hypergeometric(40, 17, 7, k))
      .reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(1, 10)
  })

  it('P(X=2) in 40-card/17-land/7-drawn is in plausible range', () => {
    const p = hypergeometric(40, 17, 7, 2)
    expect(p).toBeGreaterThan(0.2)
    expect(p).toBeLessThan(0.4)
  })
})

describe('buildMatrix', () => {
  it('returns 5 rows for default hands [7,8,9,10,11]', () => {
    expect(buildMatrix(40, 17)).toHaveLength(5)
  })

  it('each row has 12 entries (k=0..11)', () => {
    for (const row of buildMatrix(40, 17)) {
      expect(row).toHaveLength(12)
    }
  })

  it('each row sums to 1', () => {
    for (const row of buildMatrix(40, 17)) {
      expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10)
    }
  })
})
