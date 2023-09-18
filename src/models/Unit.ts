import {Container, Graphics, Sprite, Texture} from "pixi.js"
import {EventEmitter} from "events"
import type {ContextManager} from "@/models/ContextManager"
import type {UnwrapNestedRefs} from "vue"
import {calculateDistance, generateUniqueId} from "@/utils/util"
import {gsap} from "gsap"

export type UnitOption = {
  x: number
  y: number
  texture: string
}

export class Unit extends EventEmitter {
  id = generateUniqueId()
  sprite: Sprite
  movingAnimation?: gsap.core.Tween

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

    this.contextManager.on('selectedUnits', (units: Unit[]) => {
      const rectangle2 = new Graphics()
      rectangle2.lineStyle(2, 0xFF00FF)
      rectangle2.drawRect(0, 0, 50, 50)

      if (units.map((unit) => unit.id).includes(this.id)) {
        this.sprite.addChild(rectangle2)
      } else {
        if (this.sprite.children.length)
          this.sprite.children.forEach((item) => this.sprite.removeChildAt(0))
      }
    })

    this.contextManager.on('collideWall', (unit, immobileArea) => {
      if (unit.id === this.id) {

        if (immobileArea.x2 - this.sprite.x <= 10)
          this.sprite.x += 2
        if ((this.sprite.x + this.sprite.width) - immobileArea.x1 <= 10)
          this.sprite.x -= 2
        if (immobileArea.y2 - this.sprite.y <= 10)
          this.sprite.y += 2
        if ((this.sprite.y + this.sprite.height) - immobileArea.y2 <= 10)
          this.sprite.y -= 2

        this.movingAnimation?.pause()
      }
    })

    this.contextManager.on('move', ({offsetX, offsetY}: MouseEvent) => {
      this.contextManager.selectedUnits.forEach((unit) => {
        if (unit.id === this.id) {
          this.movingAnimation?.pause()
          const distance = calculateDistance(offsetX, offsetY, this.sprite.x, this.sprite.y)

          this.movingAnimation = gsap.to(this.sprite, {
            x: offsetX,
            y: offsetY,
            duration: distance / 250,
            ease: 'linear'
          })

          const angleDegrees = Math.atan2(offsetY - this.sprite.y, offsetX - this.sprite.x) * (180 / Math.PI) + 90

          gsap.to(this.sprite, {
            rotation: (Math.PI / 180) * angleDegrees,
            duration: .1,
            ease: 'linear'
          })
        }
      })
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