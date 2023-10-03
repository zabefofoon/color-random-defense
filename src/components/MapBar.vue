<template>
  <div class="w-full h-10 fixed top-0"
       @mouseenter="handleMouseEnterHandler('up')"
       @mouseleave="handleMouseLeaveHandler"></div>
  <div class="w-full h-10 fixed bottom-0"
       @mouseenter="handleMouseEnterHandler('down')"
       @mouseleave="handleMouseLeaveHandler"></div>
  <div class="w-10 h-full fixed top-0 left-0"
       @mouseenter="handleMouseEnterHandler('left')"
       @mouseleave="handleMouseLeaveHandler"></div>
  <div class="w-10 h-full fixed top-0 right-0"
       @mouseenter="handleMouseEnterHandler('right')"
       @mouseleave="handleMouseLeaveHandler"></div>
  <div class="w-10 h-10 fixed top-0 left-0"
       @mouseenter="handleMouseEnterHandler('leftUp')"
       @mouseleave="handleMouseLeaveHandler"></div>
  <div class="w-10 h-10 fixed top-0 right-0"
       @mouseenter="handleMouseEnterHandler('rightUp')"
       @mouseleave="handleMouseLeaveHandler"></div>
  <div class="w-10 h-10 fixed bottom-0 right-0"
       @mouseenter="handleMouseEnterHandler('rightDown')"
       @mouseleave="handleMouseLeaveHandler"></div>
  <div class="w-10 h-10 fixed bottom-0 left-0"
       @mouseenter="handleMouseEnterHandler('leftDown')"
       @mouseleave="handleMouseLeaveHandler"></div>
</template>

<script setup lang="ts">
import {ref} from "vue"
import {Direction} from "@/models/Direction"

const isMouseEnter = ref(false)
let timer
const checkMouseEnter = (value: boolean) => isMouseEnter.value = value

const handleMouseEnterHandler = (direction: Direction) => {
  checkMouseEnter(true)
  timer = setInterval(() => {
    const step = 5
    if (direction === 'left')
      window.scrollTo(window.scrollX - step, window.scrollY)
    if (direction === 'up')
      window.scrollTo(window.scrollX, window.scrollY - step)
    if (direction === 'right')
      window.scrollTo(window.scrollX + step, window.scrollY)
    if (direction === 'down')
      window.scrollTo(window.scrollX, window.scrollY + step)
    if (direction === 'leftUp')
      window.scrollTo(window.scrollX - step, window.scrollY - step)
    if (direction === 'rightUp')
      window.scrollTo(window.scrollX + step, window.scrollY - step)
    if (direction === 'rightDown')
      window.scrollTo(window.scrollX + step, window.scrollY + step)
    if (direction === 'leftDown')
      window.scrollTo(window.scrollX - step, window.scrollY + step)
  })
}

const handleMouseLeaveHandler = () => {
  checkMouseEnter(false)
  clearInterval(timer)
}
</script>

<style scoped lang="scss">

</style>