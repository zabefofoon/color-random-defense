import {generateUniqueId} from "@/utils/util"
import {Container, Graphics, Sprite, Texture} from "pixi.js"
import type {UnwrapNestedRefs} from "vue"
import {ContextManager} from "@/models/ContextManager"
import type {UnitOption} from "@/models/Unit"
import {EventEmitter} from "events"
import type {RectCoords} from "@/models/SelectArea"

export class Wall extends EventEmitter {
  id = generateUniqueId()
  sprite: Sprite

  constructor(private readonly contextManager: UnwrapNestedRefs<ContextManager>,
              option?: UnitOption) {
    super()

    this.sprite = new Sprite(Texture.from(option?.texture || ''))

    this.sprite.x = option?.x || 0
    this.sprite.y = option?.y || 0
    this.sprite.width = 50
    this.sprite.height = 50
    this.sprite.pivot.x = this.sprite.width / 2
    this.sprite.pivot.y = this.sprite.height / 2
  }

  render(container: Container) {
    if (this.sprite) container.addChild(this.sprite)
    return this
  }

  createImmobileArea(): RectCoords {
    return {
      x1: this.sprite.x,
      y1: this.sprite.y,
      x2: this.sprite.x + this.sprite.width,
      y2: this.sprite.y + this.sprite.height
    }
  }

  static of(contextManager: UnwrapNestedRefs<ContextManager>,
            option?: UnitOption) {
    return new Wall(contextManager, option)
  }
}