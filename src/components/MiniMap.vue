<template>
  <div class="fixed right-0 bottom-0 | border border-black"
       :style="{width: `${mapWidth / 10}px`, height:`${mapHeight / 10}px`}"
       @mousemove="mousemoveHandler">
    <img class="w-full h-full | pointer-events-none opacity-20"
         alt="map"
         src="@/assets/map.png"
         :draggable="false"/>
    <div class="absolute | border-2 border-red-500 pointer-events-none"
         :style="currentViewStyle"></div>
    <div v-for="(unitPos, index) in unitsPos"
         :key="index"
         class="absolute w-1 h-1 | bg-red-500 pointer-events-none"
         :style="getUnitPosition(unitPos)">
    </div>
    <div v-for="(wallPos, index) in wallsPos"
         :key="index"
         class="absolute | bg-gray-500 pointer-events-none"
         :style="getWallStyle(wallPos)">
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref} from "vue"
import type {ContextManager} from "@/models/ContextManager"

defineProps<{
  contextManager: ContextManager
  unitsPos: { x: number, y: number }[]
  wallsPos: { x: number, y: number, width: number, height: number }[]
  mapWidth: number
  mapHeight: number
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

const getWallStyle = (unitPos: { x: number, y: number, width: number, height: number }) => {
  return {
    top: `${unitPos.y / 10}px`,
    left: `${unitPos.x / 10}px`,
    width: `${unitPos.width / 10}px`,
    height: `${unitPos.height / 10}px`,
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
.bg-a {
  background: #d1d4d9;
}
</style>