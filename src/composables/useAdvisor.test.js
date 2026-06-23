import { describe, it, expect } from 'vitest'
import { useAdvisor } from './useAdvisor.js'
import { useLandProbability } from './useLandProbability.js'
import { useColorProbability } from './useColorProbability.js'

function setup(deckSizeVal, landCountVal) {
  const land = useLandProbability()
  land.deckSize.value = deckSizeVal
  land.landCount.value = landCountVal
  const color = useColorProbability(land.deckSize, land.landMatrix)
  const advisor = useAdvisor(land, color)
  return { land, color, advisor }
}

describe('benchmark warnings', () => {
  it('warns when 40-card deck has far too few lands (14 < 17)', () => {
    const { advisor } = setup(40, 14)
    const warns = advisor.advisorMessages.value.filter(m => m.type === 'warn')
    expect(warns.some(m => m.text.includes('偏少'))).toBe(true)
  })

  it('warns when 60-card deck has far too few lands (20 < 24)', () => {
    const { advisor } = setup(60, 20)
    const warns = advisor.advisorMessages.value.filter(m => m.type === 'warn')
    expect(warns.some(m => m.text.includes('偏少'))).toBe(true)
  })

  it('shows ok for 40-card deck with 17 lands', () => {
    const { advisor } = setup(40, 17)
    expect(advisor.advisorMessages.value.some(m => m.type === 'ok')).toBe(true)
  })
})

describe('probability warnings', () => {
  it('warns for too few lands: P(0-1 land in 7) > 25%', () => {
    const { advisor } = setup(40, 5) // 5 lands → high screw chance
    expect(advisor.advisorMessages.value.some(m => m.text.includes('卡頓'))).toBe(true)
  })

  it('warns for too many lands: P(5+ lands in 7) > 20%', () => {
    const { advisor } = setup(40, 30) // 30 lands → high flood chance
    expect(advisor.advisorMessages.value.some(m => m.text.includes('浪費'))).toBe(true)
  })
})

describe('colour validation', () => {
  it('warns when colour sum exceeds land count', () => {
    const { land, color, advisor } = setup(40, 17)
    color.colorCounts.value = { B: 10, W: 10, U: 0, G: 0, R: 0 } // 20 > 17
    expect(advisor.advisorMessages.value.some(m => m.text.includes('色源') && m.type === 'warn')).toBe(true)
  })
})
