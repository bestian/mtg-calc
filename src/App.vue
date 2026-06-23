<script setup>
import { useLandProbability } from './composables/useLandProbability.js'
import { useColorProbability } from './composables/useColorProbability.js'
import { useAdvisor } from './composables/useAdvisor.js'
import DeckConfig from './components/DeckConfig.vue'
import AdvisorCard from './components/AdvisorCard.vue'
import LandSection from './components/LandSection.vue'
import ColorConfig from './components/ColorConfig.vue'
import ColorSection from './components/ColorSection.vue'

const land = useLandProbability()
const color = useColorProbability(land.deckSize, land.landMatrix)
const advisor = useAdvisor(land, color)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-gray-900 text-white text-center py-4 text-xl font-bold tracking-wide">
      🃏 MTG 機率計算機
    </header>

    <main class="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <DeckConfig
        :deckSize="land.deckSize.value"
        :landCount="land.landCount.value"
        :isValid="land.isValid.value"
        :playFirst="color.playFirst.value"
        @update:deckSize="land.deckSize.value = $event"
        @update:landCount="land.landCount.value = $event"
        @update:playFirst="color.playFirst.value = $event"
      />

      <AdvisorCard :messages="advisor.advisorMessages.value" />

      <LandSection
        :matrix="land.landMatrix.value"
        :isValid="land.isValid.value"
      />

      <ColorConfig
        :colorCounts="color.colorCounts.value"
        :manaCost="color.manaCost.value"
        :parsedCost="color.parsedCost.value"
        @update:colorCounts="color.colorCounts.value = $event"
        @update:manaCost="color.manaCost.value = $event"
      />

      <ColorSection
        :colorMatrix="color.colorMatrix.value"
        :castability="color.castability.value"
        :parsedCost="color.parsedCost.value"
      />
    </main>
  </div>
</template>
