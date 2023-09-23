import {generateUniqueId} from "@/utils/util"
import {Container, Sprite, Texture} from "pixi.js"
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
        .find((child) => child instanceof Sprite)!
  }

  render(container: Container) {
    if (this.container) container.addChild(this.container)
    return this
  }

  private initContainer(option?: UnitOption) {
    this.container.x = option?.x || 0
    this.container.y = option?.y || 0
    this.container.width = option?.width || 50
    this.container.height = option?.height || 50
  }

  private createSprite(option?: UnitOption) {
    const sprite = new Sprite(Texture.from(option?.texture || ''))

    sprite.x = -(option?.width || 50)
    sprite.y = -(option?.height || 50)
    sprite.width = option?.width || 50
    sprite.height = option?.height || 50

    return sprite
  }

  static of(contextManager: UnwrapNestedRefs<ContextManager>,
            option?: UnitOption) {
    return new Wall(contextManager, option)
  }
}