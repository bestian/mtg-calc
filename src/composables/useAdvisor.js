import { computed } from 'vue'

const COLORS = ['B', 'W', 'U', 'G', 'R']
const BENCHMARKS = { 40: 17, 60: 24 }

function recommendedLands(deckSize) {
  return BENCHMARKS[deckSize] ?? Math.round(deckSize * 0.425)
}

export function useAdvisor(land, color) {
  const advisorMessages = computed(() => {
    const msgs = []
    const { deckSize, landCount, landMatrix, isValid } = land
    const { colorCounts, castability, playFirst } = color

    if (!isValid.value) {
      msgs.push({ type: 'warn', text: '牌組設定無效（地牌數超過牌組總數）' })
      return msgs
    }

    // Benchmark
    const rec = recommendedLands(deckSize.value)
    const diff = landCount.value - rec
    if (diff < -2) {
      msgs.push({ type: 'warn', text: `地牌偏少（建議 ${rec} 張，目前 ${landCount.value} 張）` })
    } else if (diff > 2) {
      msgs.push({ type: 'warn', text: `地牌偏多（建議 ${rec} 張，目前 ${landCount.value} 張）` })
    } else {
      msgs.push({ type: 'ok', text: `地牌數量合理（建議 ${rec} 張，目前 ${landCount.value} 張）` })
    }

    // Probability warnings on 7-card opening hand
    const row7 = landMatrix.value[0]
    const pScrew = (row7[0] ?? 0) + (row7[1] ?? 0)
    const pFlood = row7.slice(5).reduce((a, b) => a + b, 0)

    if (pScrew > 0.25) {
      msgs.push({ type: 'warn', text: `地牌過少，起手卡頓風險高（P(≤1地) = ${(pScrew * 100).toFixed(1)}%）` })
    }
    if (pFlood > 0.20) {
      msgs.push({ type: 'warn', text: `地牌過多，資源浪費風險高（P(≥5地) = ${(pFlood * 100).toFixed(1)}%）` })
    }

    // Colour sum validation
    const colorSum = COLORS.reduce((s, c) => s + (colorCounts.value[c] || 0), 0)
    if (colorSum > landCount.value) {
      msgs.push({ type: 'warn', text: `色源總數（${colorSum}）超過地牌數（${landCount.value}），請確認色源分配` })
    }

    // Castability warning for turn 3. On the play, turn 3 is round index 2; on the draw, turn 3 is round index 3.
    if (castability.value !== null) {
      const targetIndex = playFirst.value ? 2 : 3
      const pCast = castability.value[targetIndex] ?? 0
      if (pCast < 0.50) {
        msgs.push({ type: 'warn', text: `色源不足，難以如期施放（第3回合施放率 ${(pCast * 100).toFixed(1)}%，需 CMC 張地且足夠色源）` })
      } else {
        msgs.push({ type: 'info', text: `第3回合施放率 ${(pCast * 100).toFixed(1)}%` })
      }
    }

    return msgs
  })

  return { advisorMessages }
}
