<template>
  <main ref="main"
        @mousemove="contextManager.emitMousemove"
        @mousedown="contextManager.emitMousedown"
        @mouseup="contextManager.emitMouseup"
        @contextmenu.prevent="contextManager.move">
  </main>
</template>

<script setup lang="ts">
import {Application, Container} from 'pixi.js'
import {onMounted, ref} from "vue"
import {ContextManager} from "@/models/ContextManager"
import box from "@/assets/box.png"
import ring from "@/assets/ring.png"

const main = ref<HTMLDivElement>()

const app = new Application({
  width: window.innerWidth,
  height: window.innerHeight,
  resizeTo: window,
  antialias: true,
  background: 'ffffff'
})

const contextManager = ContextManager.of(app)

onMounted(() => {
  const canvasEl = document.getElementsByTagName('canvas')[0]
  if (canvasEl) main.value?.removeChild(canvasEl)

  main.value?.appendChild(app.view)


  contextManager.createUnit({
    x: app.renderer.width / 2,
    y: app.renderer.height / 2,
    texture: ring,
    movable: true
  })

  contextManager.createUnit({
    x: app.renderer.width / 2 + 200,
    y: app.renderer.height / 2 + 200,
    texture: ring,
    movable: true
  })

  contextManager.createUnit({
    x: (app.renderer.width / 2) + 100,
    y: (app.renderer.height / 2) + 100,
    texture: ring,
  })

  contextManager.createWall({
    x: 300,
    y: 300,
    width: 50,
    height: 50,
    texture: box
  })


  app.ticker.add(() => {
    contextManager.detectCollideWall()
    contextManager.detectCollideCircle()
  })

  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight)
  })
})
</script>

<style scoped lang="scss">

</style>