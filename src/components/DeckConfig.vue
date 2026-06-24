<script setup>
const PRESETS = [40, 60]

const props = defineProps({
  deckSize: { type: Number, required: true },
  landCount: { type: Number, required: true },
  isValid: { type: Boolean, required: true },
  playFirst: { type: Boolean, required: true },
})
const emit = defineEmits(['update:deckSize', 'update:landCount', 'update:playFirst'])

function onDeckInput(e) {
  const v = parseInt(e.target.value, 10)
  if (!isNaN(v) && v >= 7) emit('update:deckSize', v)
}

function onLandInput(e) {
  const v = parseInt(e.target.value, 10)
  if (!isNaN(v) && v >= 0) emit('update:landCount', v)
}
</script>

<template>
  <section class="bg-white rounded-xl shadow p-4 space-y-4">
    <h2 class="font-bold text-lg">牌組設定</h2>
  </section>
  <section class="flex flex-col md:flex-row gap-4 bg-white rounded-xl shadow p-4 space-y-4">

    <div class="flex space-y-2">
      <div class="flex gap-2">
        <button
          @click="emit('update:playFirst', true)"
          :class="[
            'px-4 py-2 rounded border font-medium text-sm transition',
            playFirst
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400',
          ]"
        >先手</button>
        <button
          @click="emit('update:playFirst', false)"
          :class="[
            'px-4 py-2 rounded border font-medium text-sm transition',
            !playFirst
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400',
          ]"
        >後手</button>
      </div>
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">牌組張數</label>
      <div class="flex gap-2 flex-wrap items-center">
        <button
          v-for="preset in PRESETS"
          :key="preset"
          @click="emit('update:deckSize', preset)"
          :class="[
            'px-4 py-2 rounded border font-medium text-sm transition',
            deckSize !== 40 && deckSize !== 60 ? 'opacity-50' : '',
            deckSize === preset
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400',
          ]"
        >{{ preset }} 張</button>
        <input
          type="number"
          min="40"
          :placeholder="PRESETS.includes(deckSize) ? '自訂' : deckSize"
          @input="onDeckInput"
          :class="
          [
            deckSize === 40 || deckSize === 60 ? 'opacity-50' : '',
          ]"
          class="w-24 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        />
      </div>
    </div>

    <div class="flex gap-6 flex-wrap">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">地牌數</label>
        <input
          type="number"
          :value="landCount"
          @input="onLandInput"
          min="0"
          :max="deckSize"
          :class="[
            'w-24 border rounded px-3 py-2 text-sm focus:outline-none',
            isValid ? 'border-gray-300 focus:border-indigo-500' : 'border-red-500',
          ]"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">非地牌數</label>
        <input
          type="number"
          :value="deckSize - landCount"
          readonly
          class="w-24 border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-400"
        />
      </div>
    </div>

    <p v-if="!isValid" class="text-red-600 text-sm">地牌數不得超過牌組總數</p>
  </section>
</template>
