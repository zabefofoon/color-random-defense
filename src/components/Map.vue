<template>
  <div class="fixed right-1 bottom-1 | border border-black"
       style="width: 300px; height: 300px;"
       @mousemove="mousemoveHandler">
    <img class="w-full h-full | pointer-events-none"
         alt="map"
         src="@/assets/map.png"
         :draggable="false"/>
    <div class="absolute | border-2 border-red-500 pointer-events-none"
         :style="currentViewStyle"></div>
    <div v-for="(unitPos, index) in unitsPos"
         :key="index"
         class="absolute w-1 h-1 bg-red-500"
         :style="getUnitPosition(unitPos)">
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue"
import type {ContextManager} from "@/models/ContextManager"

const props = defineProps<{
  contextManager: ContextManager
  unitsPos: { x: number, y: number }[]
}>()

const width = ref()
const height = ref()
const setSize = (w: number, h: number) => {
  width.value = w
  height.value = h
}

const left = ref()
const top = ref()
const setPosition = (x: number, y: number) => {
  left.value = x
  top.value = y
}

const currentViewStyle = computed(() => ({
  width: `${width.value / 10}px`,
  height: `${height.value / 10}px`,
  top: `${top.value / 10}px`,
  left: `${left.value / 10}px`
}))

const getUnitPosition = (unitPos: { x: number, y: number }) => {
  return {
    top: `${unitPos.y / 10}px`,
    left: `${unitPos.x / 10}px`,
  }
}

const mousemoveHandler = ({buttons, offsetX, offsetY}: MouseEvent) => {
  if (buttons === 1)
    window.scrollTo(offsetX * 10 - width.value / 2, offsetY * 10 - height.value / 2)
}

onMounted(() => {
  setSize(window.innerWidth, window.innerHeight)
  window.addEventListener('resize', () => {
    setSize(window.innerWidth, window.innerHeight)
  })

  setPosition(window.scrollX, window.scrollY)
  window.addEventListener('scroll', () => {
    setPosition(window.scrollX, window.scrollY)
  })
})
</script>

<style scoped lang="scss">

</style>