import {generateUniqueId} from "@/utils/util"
import {Container, Graphics, Sprite, Texture} from "pixi.js"
import type {UnwrapNestedRefs} from "vue"
import {ContextManager} from "@/models/ContextManager"
import type {UnitOption} from "@/models/Unit"
import {EventEmitter} from "events"

export class Wall extends EventEmitter {
  id = generateUniqueId()
  container = new Container()

  constructor(private readonly contextManager: UnwrapNestedRefs<ContextManager>,
              option?: UnitOption) {
    super()

    this.container.x = option?.x || 0
    this.container.y = option?.y || 0
    this.container.width = 50
    this.container.height = 50

    const sprite = new Sprite(Texture.from(option?.texture || ''))

    sprite.x = -50
    sprite.y = -50
    sprite.width = 50
    sprite.height = 50

    const circle = new Graphics()
    circle.lineStyle(1, '0xff0000', .5)
    circle.beginFill('0xff0000', .1)
    circle.drawCircle(-25, -25, 100)
    circle.endFill()

    this.container.addChild(circle)
    this.container.addChild(sprite)

    const rect = new Graphics()
    rect.lineStyle(2, 0x000000)
    rect.drawRect(-50, -50, 50, 50)
    this.container.addChild(rect)

  }

  get sprite() {
    return this.container.children.find((child) => child instanceof Sprite)!
  }

  render(container: Container) {
    if (this.container) container.addChild(this.container)
    return this
  }


  static of(contextManager: UnwrapNestedRefs<ContextManager>,
            option?: UnitOption) {
    return new Wall(contextManager, option)
  }
}