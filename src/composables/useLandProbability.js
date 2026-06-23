import { ref, computed } from 'vue'
import { buildMatrix } from '../math/hypergeometric.js'

export function useLandProbability() {
  const deckSize = ref(40)
  const landCount = ref(17)

  const nonlandCount = computed(() => deckSize.value - landCount.value)

  const isValid = computed(() =>
    deckSize.value >= 7 &&
    landCount.value >= 0 &&
    landCount.value <= deckSize.value
  )

  const landMatrix = computed(() => {
    if (!isValid.value) return Array.from({ length: 5 }, () => new Array(12).fill(0))
    return buildMatrix(deckSize.value, landCount.value)
  })

  return { deckSize, landCount, nonlandCount, isValid, landMatrix }
}
