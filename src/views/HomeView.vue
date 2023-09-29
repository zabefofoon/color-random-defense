<template>
  <main ref="main"
        class="border-0 outline-0"
        :class="{'cursor-pointer': isAttack}"
        tabindex="0"
        @mousemove="contextManager.emitMousemove"
        @mousedown="contextManager.emitMousedown"
        @mouseup="contextManager.emitMouseup"
        @keydown="contextManager.emitKeydown"
        @contextmenu.prevent="contextManager.move">
  </main>
</template>

<script setup lang="ts">
import {Application} from 'pixi.js'
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

// app.ticker.maxFPS = 60

const contextManager = ContextManager.of(app)

const isAttack = ref(false)
const checkAttack = (value: boolean) => isAttack.value = value


onMounted(() => {
  const canvasEl = document.getElementsByTagName('canvas')[0]
  if (canvasEl) main.value?.removeChild(canvasEl)

  main.value?.appendChild(app.view)

  contextManager.createUnit({
    x: app.renderer.width / 2,
    y: app.renderer.height / 2,
    texture: ring,
    movable: true,
    attackable: true
  })


  contextManager.createUnit({
    x: app.renderer.width / 2 - 200,
    y: app.renderer.height / 2 - 200,
    texture: ring,
    movable: true,
    attackable: true
  })


  const enemy = contextManager.createUnit({
    x: app.renderer.width / 2 + 200,
    y: app.renderer.height / 2 + 200,
    texture: ring,
    movable: false
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


  let direct = 'right'


  app.ticker.add(() => {
    contextManager.detectCollideWall()
    contextManager.detectCollideCircle()
    contextManager.detectCollideAttackArea()
    contextManager.updateBullet()
    contextManager.units.forEach((unit) => unit.attack())

    if (enemy?.container) {
      if (enemy.container.x >= 1200)
        direct = 'left'
      if (enemy.container.x <= 0)
        direct = 'right'

      enemy.container.x = enemy.container.x + (direct === 'right' ? 2 : -2)
    }
  })

  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight)
  })

  contextManager.on('attackReady', () => {
    checkAttack(true)
  })

  contextManager.on('attackStart', () => {
    checkAttack(false)
  })
})
</script>

<style scoped lang="scss">

</style>