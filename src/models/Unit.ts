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
  movable?: boolean
}

export class Unit extends EventEmitter {
  id = generateUniqueId()
  container: Container = new Container<DisplayObject>()
  movingAnimation?: gsap.core.Tween

  selectedIndicator = new Graphics()
  preselectedIndicator = new Graphics()

  movable: boolean

  constructor(private readonly contextManager: UnwrapNestedRefs<ContextManager>,
              option?: UnitOption) {
    super()

    this.movable = option?.movable || false

    this.container.x = option?.x || 0
    this.container.y = option?.y || 0


    const circle = new Graphics()
    circle.beginFill(0xFF0000, .1)
    circle.drawCircle(0, 0, 150)
    circle.endFill()
    this.container.addChild(circle)

    const sprite = new Sprite(Texture.from(option?.texture || ''))
    sprite.width = 50
    sprite.height = 50
    sprite.x = -25
    sprite.y = -25
    sprite.eventMode = 'static'


    sprite.on('mouseover', () => {
      this.preselectedIndicator.lineStyle(2, 0xFF00FF, .3)
      this.preselectedIndicator.drawCircle(0, 0, 25)
      this.container.addChild(this.preselectedIndicator)
    })

    sprite.on('mouseleave', () => {
      this.container.removeChild(this.preselectedIndicator)
    })

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
        this.movingAnimation?.pause()

        const unitBounds = unit.sprite.getBounds()
        const wallBounds = wall.sprite.getBounds()


        const unitCenterX = unitBounds.x + unitBounds.width / 2
        const unitCenterY = unitBounds.y + unitBounds.height / 2
        const wallCenterX = wallBounds.x + wallBounds.width / 2
        const wallCenterY = wallBounds.y + wallBounds.height / 2

        const offsetX = unitCenterX >= wallCenterX ? 10 : -10
        const offsetY = unitCenterY >= wallCenterY ? 10 : -10

        unit.container.x += offsetX
        unit.container.y += offsetY
      }
    })

    this.contextManager.on('collideUnits', (unit1, unit2) => {
      if (this.movable && this.id === unit1.id) {
        const thisCenterX = this.container.getBounds().x + this.container.getBounds().width / 2
        const anotherCenterX = unit2.container.getBounds().x + unit2.container.getBounds().width / 2
        const thisCenterY = this.container.getBounds().y + this.container.getBounds().height / 2
        const anotherCenterY = unit2.container.getBounds().y + unit2.container.getBounds().height / 2

        this.container.x += thisCenterX >= anotherCenterX ? 1 : -1
        this.container.y += thisCenterY >= anotherCenterY ? 1 : -1
      }
    })

    if (this.movable)
      this.contextManager.on('move', ({offsetX, offsetY}: MouseEvent) => {
        this.contextManager.selectedUnits.forEach((unit) => {
          if (unit.id === this.id) {
            this.movingAnimation?.pause()
            const distance = calculateDistance(offsetX, offsetY, this.container.x, this.container.y)

            this.movingAnimation = gsap.to(this.container, {
              x: offsetX,
              y: offsetY,
              duration: distance / 250,
              ease: 'linear',
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

  render() {
    if (this.container) this.contextManager.container.addChild(this.container)
    return this
  }

  static of(contextManager: UnwrapNestedRefs<ContextManager>,
            option?: UnitOption) {
    return new Unit(contextManager, option)
  }
}