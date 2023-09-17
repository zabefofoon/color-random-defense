import {Container, Graphics, Sprite, Texture} from "pixi.js"
import {EventEmitter} from "events"
import type {ContextManager} from "@/models/ContextManager"
import type {UnwrapNestedRefs} from "vue"
import {generateUniqueId} from "@/utils/util"

export type UnitOption = {
  x: number
  y: number
  mass?: number
}

export class Unit extends EventEmitter {
  id = generateUniqueId()
  sprite: Sprite

  constructor(private readonly contextManager: UnwrapNestedRefs<ContextManager>,
              option?: UnitOption) {
    super()

    const texture = Texture.from('https://pixijs.com/assets/bunny.png')
    this.sprite = new Sprite(texture)

    this.sprite.x = option?.x || 0
    this.sprite.y = option?.y || 0

    this.contextManager.on('selectedUnits', (units: Unit[]) => {
      const rectangle2 = new Graphics()
      rectangle2.lineStyle(2, 0xFF00FF)
      rectangle2.drawRect(-12.5, -6.25, 50, 50)

      if (units.map((unit) => unit.id).includes(this.id)) {
        this.sprite.addChild(rectangle2)
      } else {
        if (this.sprite.children.length)
          this.sprite.children.forEach((item) => this.sprite.removeChildAt(0))
      }
    })
  }

  render(container: Container) {
    if (this.sprite) container.addChild(this.sprite)
    return this
  }

  static of(contextManager: UnwrapNestedRefs<ContextManager>,
            option?: UnitOption) {
    return new Unit(contextManager, option)
  }
}