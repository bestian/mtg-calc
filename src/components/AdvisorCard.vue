<script setup>
defineProps({
  messages: { type: Array, required: true },
})
const ICONS = { warn: '🟡', ok: '🟢', info: '🔵' }
const TEXT_CLASS = { warn: 'text-yellow-800', ok: 'text-green-800', info: 'text-blue-800' }
</script>

<template>
  <section v-if="messages.length" class="bg-white rounded-xl shadow p-4 space-y-2">
    <h2 class="font-bold text-lg">建議</h2>
    <ul class="space-y-1">
      <li v-for="(msg, i) in messages" :key="i" class="flex items-start gap-2 text-sm">
        <span class="shrink-0">{{ ICONS[msg.type] }}</span>
        <span :class="TEXT_CLASS[msg.type]">{{ msg.text }}</span>
      </li>
    </ul>
  </section>
</template>
