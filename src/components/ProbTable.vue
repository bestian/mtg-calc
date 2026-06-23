<script setup>
defineProps({
  matrix: { type: Array, required: true },
  rowLabels: { type: Array, required: true },
  colLabels: { type: Array, required: true },
})

const fmt = p => (p * 100).toFixed(1) + '%'
</script>

<template>
  <div class="overflow-x-auto">
    <table class="text-sm w-full border-collapse">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 px-2 py-1 text-left whitespace-nowrap">手牌數</th>
          <th
            v-for="col in colLabels"
            :key="col"
            class="border border-gray-300 px-2 py-1 text-center"
          >{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in matrix" :key="i">
          <td class="border border-gray-300 px-2 py-1 font-medium bg-gray-50 whitespace-nowrap">
            {{ rowLabels[i] }}
          </td>
          <td
            v-for="(p, k) in row"
            :key="k"
            class="border border-gray-300 px-2 py-1 text-center"
            :class="p > 0.3 ? 'text-indigo-700 font-semibold' : 'text-gray-600'"
          >{{ fmt(p) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
