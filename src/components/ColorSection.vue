<script setup>
import ProbChart from './ProbChart.vue'
import ProbTable from './ProbTable.vue'

defineProps({
  colorMatrix: { type: Object, required: true },
  castability: { type: Array, default: null },
  parsedCost: { type: Object, default: null },
})

const COLOR_NAMES = { B: '黑(B)', W: '白(W)', U: '藍(U)', G: '綠(G)', R: '紅(R)' }
const ROW_LABELS = ['7張', '8張', '9張', '10張', '11張']
const COL_LABELS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11+']
const fmt = p => (p * 100).toFixed(1) + '%'
</script>

<template>
  <template v-if="Object.keys(colorMatrix).length > 0">
    <!-- Per-colour distribution -->
    <section
      v-for="(matrix, color) in colorMatrix"
      :key="color"
      class="bg-white rounded-xl shadow p-4 space-y-4"
    >
      <h2 class="font-bold text-lg">{{ COLOR_NAMES[color] }} 色源分佈</h2>
      <p class="text-sm text-gray-400">橫軸：抽到該色地牌數；各組顏色：起手張數（7–11張）</p>
      <ProbChart :matrix="matrix" :labels="COL_LABELS" />
      <ProbTable :matrix="matrix" :rowLabels="ROW_LABELS" :colLabels="COL_LABELS" />
    </section>

    <!-- Castability table -->
    <section v-if="castability && parsedCost" class="bg-white rounded-xl shadow p-4 space-y-3">
      <h2 class="font-bold text-lg">施放機率（CMC {{ parsedCost.cmc }}）</h2>
      <p class="text-sm text-gray-400">每回合抽牌後,手牌同時滿足費用的機率</p>
      <div class="overflow-x-auto">
        <table class="text-sm w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-3 py-2 text-left">手牌數</th>
              <th class="border border-gray-300 px-3 py-2 text-center">施放率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in castability" :key="i">
              <td class="border border-gray-300 px-3 py-2 font-medium bg-gray-50">{{ ROW_LABELS[i] }}</td>
              <td
                class="border border-gray-300 px-3 py-2 text-center font-semibold"
                :class="p >= 0.5 ? 'text-green-700' : 'text-red-600'"
              >{{ fmt(p) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </template>
</template>
