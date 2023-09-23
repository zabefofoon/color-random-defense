import {Container, DisplayObject, Graphics, Sprite, Texture} from "pixi.js"
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
  container: Container = new Container()
  movingAnimation?: gsap.core.Tween

  selectedIndicator = new Graphics()

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
    const circle = new Graphics()
    circle.lineStyle(2, 0x0000FF)
    circle.pivot.x = -25
    circle.pivot.y = -25
    circle.beginFill(0xFF0000);
    circle.drawCircle(0, 0, 25)
    circle.endFill();

    this.sprite.addChild(circle)

    this.contextManager.on('selectedUnits', (units: Unit[]) => {
      if (units.map((unit) => unit.id).includes(this.id)) {
        this.selectedIndicator.lineStyle(2, 0xFF00FF)
        this.selectedIndicator.drawCircle(0, 0, 25)
        this.selectedIndicator.pivot.x = -this.sprite.width / 2
        this.selectedIndicator.pivot.y = -this.sprite.height / 2
        this.sprite.addChild(this.selectedIndicator)
      } else {
        if (this.selectedIndicator)
          this.sprite.removeChild(this.selectedIndicator)
      }
    })

    this.contextManager.on('collideWall', (unit, wall) => {
      if (unit.id === this.id) {
        const dx = this.sprite.x - wall.sprite.x
        const dy = this.sprite.y - wall.sprite.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= 55) {
          const thisCenterX = this.sprite.x + this.sprite.width / 2
          const anotherCenterX = wall.sprite.x + wall.sprite.width / 2
          const thisCenterY = this.sprite.y + this.sprite.height / 2
          const anotherCenterY = wall.sprite.y + wall.sprite.height / 2

          this.sprite.x += thisCenterX > anotherCenterX ? 2 : -2
          this.sprite.y += thisCenterY > anotherCenterY ? 2 : -2
          this.movingAnimation?.pause()
        }
      }
    })

    this.contextManager.on('collideUnits', (unit1, unit2) => {
      if (this.id === unit1.id
          || this.id === unit2.id) {

        const dx = unit1.sprite.x - unit2.sprite.x
        const dy = unit1.sprite.y - unit2.sprite.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance <= 50) {
          const thisCenterX = this.sprite.x + this.sprite.width / 2
          const anotherCenterX = unit2.sprite.x + unit2.sprite.width / 2
          const thisCenterY = this.sprite.y + this.sprite.height / 2
          const anotherCenterY = unit2.sprite.y + unit2.sprite.height / 2

          this.sprite.x += thisCenterX > anotherCenterX ? 2 : -2
          this.sprite.y += thisCenterY > anotherCenterY ? 2 : -2
        }
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