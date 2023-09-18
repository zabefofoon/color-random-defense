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
import {onMounted, reactive, ref} from "vue"
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

const canvas = <Node>app.view

const container = new Container()
app.stage.addChild(container)

const contextManager = reactive(ContextManager.of(app))

onMounted(() => {
  const canvasEl = document.getElementsByTagName('canvas')[0]
  if (canvasEl) main.value?.removeChild(canvasEl)


  contextManager.createUnit({
    x: app.renderer.width / 2,
    y: app.renderer.height / 2,
    texture: ring,
  })

  contextManager.createUnit({
    x: (app.renderer.width / 2) + 100,
    y: (app.renderer.height / 2) + 100,
    texture: ring,
  })

  contextManager.createWall({
    x: (app.renderer.width / 2) - 300,
    y: (app.renderer.height / 2) - 100,
    texture: box
  })
  contextManager.createWall({
    x: (app.renderer.width / 2) - 300,
    y: (app.renderer.height / 2) - 150,
    texture: box
  })
  contextManager.createWall({
    x: (app.renderer.width / 2) - 300,
    y: (app.renderer.height / 2) - 200,
    texture: box
  })

  main.value?.appendChild(canvas)

  app.ticker.add(() => {
    contextManager.detectCollideWall()
  })

  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight)
  })
})
</script>

<style scoped lang="scss">

</style>