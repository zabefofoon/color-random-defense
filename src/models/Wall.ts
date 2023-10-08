import {generateUniqueId} from "@/utils/util"
import {BlurFilter, Container, Graphics} from "pixi.js"
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
    this.initContainer(option)

    this.container.addChild(this.createSprite(option))
  }

  get sprite() {
    return this.container
        .children
        .find((child) => child instanceof Graphics)!
  }

  render() {
    if (this.container) this.contextManager.app.stage.addChild(this.container)
    return this
  }

  private initContainer(option?: UnitOption) {
    this.container.x = option?.x || 0
    this.container.y = option?.y || 0
    this.container.width = option?.width || 50
    this.container.height = option?.height || 50
  }

  private createSprite(option?: UnitOption) {
    const rect = new Graphics()
    const blurFilter = new BlurFilter(3)
    rect.filters = [blurFilter]
    rect.beginFill(0xD1D4D9, .5)
    rect.drawRect(0, 0, option?.width || 50, option?.height || 50)
    rect.endFill()

    return rect
  }

  static of(contextManager: UnwrapNestedRefs<ContextManager>,
            option?: UnitOption) {
    return new Wall(contextManager, option)
  }
}