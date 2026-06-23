<script setup>
const COLORS = ['B', 'W', 'U', 'G', 'R']
const COLOR_LABELS = { B: '黑(B)', W: '白(W)', U: '藍(U)', G: '綠(G)', R: '紅(R)' }

const props = defineProps({
  colorCounts: { type: Object, required: true },
  manaCost: { type: String, required: true },
  parsedCost: { type: Object, default: null },
})
const emit = defineEmits(['update:colorCounts', 'update:manaCost'])

function onColorInput(color, e) {
  const v = Math.max(0, parseInt(e.target.value, 10) || 0)
  emit('update:colorCounts', { ...props.colorCounts, [color]: v })
}
</script>

<template>
  <section class="bg-white rounded-xl shadow p-4 space-y-4">
    <h2 class="font-bold text-lg">色源設定</h2>

    <div class="flex gap-4 flex-wrap">
      <div v-for="color in COLORS" :key="color">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ COLOR_LABELS[color] }}</label>
        <input
          type="number"
          min="0"
          :value="colorCounts[color]"
          @input="onColorInput(color, $event)"
          class="w-20 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        施放費用（選填,如
        <code class="bg-gray-100 rounded px-1">1GG</code>、
        <code class="bg-gray-100 rounded px-1">UB</code>）
      </label>
      <div class="flex items-center gap-2">
        <input
          type="text"
          :value="manaCost"
          @input="emit('update:manaCost', $event.target.value)"
          placeholder="e.g. 2GG"
          :class="[
            'w-36 border rounded px-3 py-2 text-sm focus:outline-none',
            manaCost && !parsedCost
              ? 'border-red-500'
              : 'border-gray-300 focus:border-indigo-500',
          ]"
        />
        <span v-if="parsedCost" class="text-sm text-gray-500">CMC {{ parsedCost.cmc }}</span>
        <span v-else-if="manaCost" class="text-sm text-red-500">格式錯誤</span>
      </div>
    </div>
  </section>
</template>
