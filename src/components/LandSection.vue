<script setup>
import ProbChart from './ProbChart.vue'
import ProbTable from './ProbTable.vue'

defineProps({
  matrix: { type: Array, required: true },
  isValid: { type: Boolean, required: true },
})

const ROW_LABELS = ['7張', '8張', '9張', '10張', '11張']
const COL_LABELS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11+']
</script>

<template>
  <section class="bg-white rounded-xl shadow p-4 space-y-4">
    <h2 class="font-bold text-lg">地牌抽取機率分佈</h2>
    <p class="text-sm text-gray-400">橫軸：抽到地牌數量；各組顏色：起手張數（7–11張）</p>
    <template v-if="isValid">
      <ProbChart :matrix="matrix" :labels="COL_LABELS" />
      <ProbTable :matrix="matrix" :rowLabels="ROW_LABELS" :colLabels="COL_LABELS" />
    </template>
    <p v-else class="text-red-500 text-sm">請先修正牌組設定</p>
  </section>
</template>
