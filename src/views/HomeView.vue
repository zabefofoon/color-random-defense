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

const main = ref<HTMLDivElement>()

const app = new Application({
  width: window.innerWidth,
  height: window.innerHeight,
  resizeTo: window,
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
    y: app.renderer.height / 2
  })

  contextManager.createUnit({
    x: (app.renderer.width / 2) + 100,
    y: (app.renderer.height / 2) + 100,
    mass: 3
  })


  main.value?.appendChild(canvas)


  /*// 그래픽 요소를 생성하고 화면에 추가합니다.
  const graphics = new Graphics()
  graphics.beginFill(0x00FF00)
  graphics.drawRect(100, 100, 100, 100)
  graphics.endFill()
  app.stage.addChild(graphics)

  let size = 100
  const sizeChangeSpeed = 1

  app.ticker.add(() => {
    // 사각형의 크기를 변경합니다.
    size += sizeChangeSpeed

    // 화면을 지웁니다.
    graphics.clear()

    // 변경된 크기로 사각형을 다시 그립니다.
    graphics.beginFill(0x00FF00)
    graphics.drawRect(100, 100, size, size)
    graphics.endFill()

    // 사각형의 크기가 일정 값 이상이 되면 크기를 다시 초기화합니다.
    if (size >= 200) {
      size = 100
    }
  })*/

  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight)
  })
})
</script>

<style scoped lang="scss">

</style>