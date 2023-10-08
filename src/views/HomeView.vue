<template>
  <div class="relative">
    <main ref="main"
          class="border-0 outline-0"
          :class="{'cursor-pointer': isAttack}"
          :style="{width: `${WIDTH}px`, height:`${HEIGHT}px`}"
          tabindex="0"
          @mousemove="contextManager.emitMousemove"
          @mousedown="contextManager.emitMousedown"
          @mouseup="contextManager.emitMouseup"
          @keydown="contextManager.emitKeydown"
          @contextmenu.prevent="contextManager.move">
    </main>
    <MiniMap :context-manager="contextManager"
             :units-pos="unitsPos"
             :walls-pos="wallsPos"
             :map-width="WIDTH"
             :map-height="HEIGHT"/>
    <MapBar/>
  </div>
</template>

<script setup lang="ts">
import {Application} from 'pixi.js'
import {onMounted, ref} from "vue"
import {ContextManager} from "@/models/ContextManager"
import ring from "@/assets/ring.png"
import MapBar from "@/components/MapBar.vue"
import MiniMap from "@/components/MiniMap.vue"
import {generateWalls} from "@/mixins/Walls"

const main = ref<HTMLDivElement>()

const WIDTH = 2500
const HEIGHT = 2500

const app = new Application({
  width: WIDTH,
  height: HEIGHT,
  antialias: true,
  background: 'ffffff'
})

app.ticker.maxFPS = 30

const contextManager = ContextManager.of(app)

const isAttack = ref(false)
const checkAttack = (value: boolean) => isAttack.value = value

const unitsPos = ref()
const wallsPos = ref()

onMounted(() => {
  const canvasEl = document.getElementsByTagName('canvas')[0]
  if (canvasEl) main.value?.removeChild(canvasEl)

  main.value?.appendChild(app.view)

  contextManager.createUnit({
    x: 1150,
    y: 675,
    texture: ring,
    movable: true,
    attackable: true
  })

  const enemy = contextManager.createUnit({
    x: 837.5,
    y: 675,
    texture: ring,
    movable: false
  })

  generateWalls(contextManager)

  wallsPos.value = contextManager.walls.map((wall) => wall.sprite.getBounds())

  /*app.ticker.add(() => {
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
  })*/

  contextManager.on('attackReady', () => checkAttack(true))
  contextManager.on('attackStart', () => checkAttack(false))
})
</script>

<style scoped lang="scss">

</style>