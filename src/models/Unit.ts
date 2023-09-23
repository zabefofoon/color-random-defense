import {Container, DisplayObject, Graphics, Sprite, Texture} from "pixi.js"
import {EventEmitter} from "events"
import type {ContextManager} from "@/models/ContextManager"
import type {UnwrapNestedRefs} from "vue"
import {calculateDistance, generateUniqueId} from "@/utils/util"
import {gsap} from "gsap"

export type UnitOption = {
  x?: number
  y?: number
  width?: number
  height?: number
  texture?: string
}

export class Unit extends EventEmitter {
  id = generateUniqueId()
  container: Container = new Container<DisplayObject>()
  movingAnimation?: gsap.core.Tween

  selectedIndicator = new Graphics()

  constructor(private readonly contextManager: UnwrapNestedRefs<ContextManager>,
              option?: UnitOption) {
    super()

    this.container.x = option?.x || 0
    this.container.y = option?.y || 0
    this.container.width = 50
    this.container.height = 50

    const circle = new Graphics()
    circle.lineStyle(1, 0xFF0000)
    circle.beginFill(0xFF0000, .1);
    circle.drawCircle(0, 0, 50)
    circle.endFill();

    this.container.addChild(circle)

    const sprite = new Sprite(Texture.from(option?.texture || ''))
    sprite.x = -25
    sprite.y = -25

    this.container.addChild(sprite)


    this.contextManager.on('selectedUnits', (units: Unit[]) => {
      if (units.map((unit) => unit.id).includes(this.id)) {
        this.selectedIndicator.lineStyle(2, 0xFF00FF)
        this.selectedIndicator.drawCircle(0, 0, 25)
        this.container.addChild(this.selectedIndicator)
      } else {
        this.container.removeChild(this.selectedIndicator)
      }
    })

    this.contextManager.on('collideWall', (unit, wall) => {
      if (unit.id === this.id) {
        const thisCenterX = (this.container.getBounds().x + this.container.getBounds().width) / 2
        const anotherCenterX = (wall.sprite.getBounds().x + wall.sprite.getBounds().width) / 2
        const thisCenterY = (this.container.getBounds().y + this.container.getBounds().height) / 2
        const anotherCenterY = (wall.sprite.getBounds().y + wall.sprite.getBounds().height) / 2

        this.container.x += thisCenterX > anotherCenterX ? 5 : -5
        this.container.y += thisCenterY > anotherCenterY ? 5 : -2
        this.movingAnimation?.pause()
      }
    })

    this.contextManager.on('collideUnits', (unit1, unit2) => {
      if (this.id === unit1.id
          || this.id === unit2.id) {

        const thisCenterX = this.container.getBounds().x + this.container.getBounds().width / 2
        const anotherCenterX = unit2.container.getBounds().x + unit2.container.getBounds().width / 2
        const thisCenterY = this.container.getBounds().y + this.container.getBounds().height / 2
        const anotherCenterY = unit2.container.getBounds().y + unit2.container.getBounds().height / 2

        this.container.x += thisCenterX >= anotherCenterX ? 5 : -5
        this.container.y += thisCenterY >= anotherCenterY ? 5 : -5
      }
    })

    this.contextManager.on('move', ({offsetX, offsetY}: MouseEvent) => {
      this.contextManager.selectedUnits.forEach((unit) => {
        if (unit.id === this.id) {
          this.movingAnimation?.pause()
          const distance = calculateDistance(offsetX, offsetY, this.container.x, this.container.y)

          this.movingAnimation = gsap.to(this.container, {
            x: offsetX,
            y: offsetY,
            duration: distance / 250,
            ease: 'linear'
          })

          const angleDegrees = Math.atan2(offsetY - this.container.y, offsetX - this.container.x) * (180 / Math.PI) + 90

          gsap.to(this.container, {
            rotation: (Math.PI / 180) * angleDegrees,
            duration: .1,
            ease: 'linear'
          })
        }
      })
    })
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
    return new Unit(contextManager, option)
  }
}