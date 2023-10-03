<template>
  <div class="relative">
    <main ref="main"
          class="border-0 outline-0"
          :class="{'cursor-pointer': isAttack}"
          style="width: 3000px; height: 3000px;"
          tabindex="0"
          @mousemove="contextManager.emitMousemove"
          @mousedown="contextManager.emitMousedown"
          @mouseup="contextManager.emitMouseup"
          @keydown="contextManager.emitKeydown"
          @contextmenu.prevent="contextManager.move">
    </main>
    <Map :context-manager="contextManager"
         :units-pos="unitsPos"/>
    <MapBar/>
  </div>
</template>

<script setup lang="ts">
import {Application} from 'pixi.js'
import {onMounted, ref} from "vue"
import {ContextManager} from "@/models/ContextManager"
import box from "@/assets/box.png"
import ring from "@/assets/ring.png"
import MapBar from "@/components/MapBar.vue"
import Map from "@/components/Map.vue"

const main = ref<HTMLDivElement>()

const app = new Application({
  width: 3000,
  height: 3000,
  antialias: true,
  background: 'ffffff'
})

// app.ticker.maxFPS = 60

const contextManager = ContextManager.of(app)

const isAttack = ref(false)
const checkAttack = (value: boolean) => isAttack.value = value

const unitsPos = ref()

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

  const enemy = contextManager.createUnit({
    x: app.renderer.width / 2 + 160,
    y: app.renderer.height / 2 + 100,
    texture: ring,
    movable: false
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
    contextManager.detectCollideAttackArea()
    contextManager.updateBullet()
    contextManager.units.forEach((unit) => {
      if (unit.attackable) unit.attack()
    })

    unitsPos.value = contextManager.units.map((unit) => {
      const unitSpriteBound = unit.sprite.getBounds()
      return {
        x: unitSpriteBound.x,
        y: unitSpriteBound.y
      }
    })
  })

  contextManager.on('attackReady', () => checkAttack(true))
  contextManager.on('attackStart', () => checkAttack(false))
})
</script>

<style scoped lang="scss">

</style>