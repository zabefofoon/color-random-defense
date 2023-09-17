import type {Sprite} from "pixi.js"
import {Application, Graphics} from "pixi.js"
import type {UnwrapNestedRefs} from "vue"
import {ContextManager} from "@/models/ContextManager"
import type {Unit} from "@/models/Unit"

export type RectCoords = {
  x1: number
  x2: number
  y1: number
  y2: number
}

export class SelectArea {
  areaCoords?: RectCoords
  selectAreaRect: Graphics

  constructor(private readonly contextManager: UnwrapNestedRefs<ContextManager>,
              private readonly app: Application) {
    this.selectAreaRect = new Graphics()

    this.contextManager.on('mousedown', ({offsetX, offsetY, buttons}: MouseEvent) => {
      if (buttons !== 1) return
      this.areaCoords = {x1: offsetX, y1: offsetY, x2: -1, y2: -1}

      const selectArea = this.areaCoords
      this.selectAreaRect.clear()
      this.selectAreaRect.lineStyle(2, 0xFF00FF)
      this.selectAreaRect.drawRect(selectArea.x1, selectArea.y1, 0, 0)
      this.app.stage.addChild(this.selectAreaRect)
    })

    this.contextManager.on('mousemove', ({buttons, offsetX, offsetY}: MouseEvent) => {
      if (buttons !== 1) return

      this.areaCoords = {...this.areaCoords || {x1: -1, y1: -1}, x2: offsetX, y2: offsetY}

      this.selectAreaRect.clear()
      const x1 = this.areaCoords.x2 - this.areaCoords.x1 < 0
          ? this.areaCoords.x2
          : this.areaCoords.x1

      const y1 = this.areaCoords.y2 - this.areaCoords.y1 < 0
          ? this.areaCoords.y2
          : this.areaCoords.y1

      const x2 = this.areaCoords.x2 - this.areaCoords.x1 < 0
          ? this.areaCoords.x1 - this.areaCoords.x2
          : this.areaCoords.x2 - this.areaCoords.x1

      const y2 = this.areaCoords.y2 - this.areaCoords.y1 < 0
          ? this.areaCoords.y1 - this.areaCoords.y2
          : this.areaCoords.y2 - this.areaCoords.y1

      this.selectAreaRect.lineStyle(2, 0xFF00FF)
      this.selectAreaRect.drawRect(x1, y1, x2, y2)
    })

    this.contextManager.on('mouseup', () => {
      if (!this.areaCoords) return

      const intersected = this.contextManager.units
          .filter((unit): unit is Unit => this.checkRectIntersectSelectArea(<RectCoords>this.areaCoords, <Sprite>unit.sprite))

      this.contextManager.selectUnits(intersected)

      this.app.stage.removeChild(this.selectAreaRect)
      this.areaCoords = undefined
    })
  }

  private checkRectIntersectSelectArea({x1, y1, x2, y2}: RectCoords,
                                       rect: Sprite) {

    const x2Left = rect.x
    const x2Right = x2Left + rect.width
    const y2Top = rect.y
    const y2Bottom = y2Top + rect.height

    // 첫 번째 사각형의 좌측 상단 점
    const x1Left = Math.min(x1, x2)
    const y1Top = Math.min(y1, y2)

    // 첫 번째 사각형의 우측 하단 점
    const x1Right = Math.max(x1, x2)
    const y1Bottom = Math.max(y1, y2)

    return (
        x2Left < x1Right &&
        x2Right > x1Left &&
        y2Top < y1Bottom &&
        y2Bottom > y1Top
    )
  }

  static of(contextManager: UnwrapNestedRefs<ContextManager>,
            app: Application) {
    return new SelectArea(contextManager, app)
  }
}