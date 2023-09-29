import {Container, DisplayObject, Graphics, Sprite, Texture} from "pixi.js"
import {EventEmitter} from "events"
import type {ContextManager} from "@/models/ContextManager"
import type {UnwrapNestedRefs} from "vue"
import {calculateDistance, generateUniqueId} from "@/utils/util"
import {gsap} from "gsap"
import {Bullet} from "@/models/Bullet"

export type UnitOption = {
  x?: number
  y?: number
  width?: number
  height?: number
  texture?: string
  movable?: boolean
  attackable?: boolean
}

export class Unit extends EventEmitter {
  id = generateUniqueId()
  container: Container = new Container<DisplayObject>()
  movingAnimation?: gsap.core.Tween
  attackAnimation?: gsap.core.Tween

  selectedIndicator = new Graphics()
  preselectedIndicator = new Graphics()

  attackArea = new Graphics()
  attackableTargetIds: string[] = []
  attackTargetId?: string

  attackCoolTime = false
  attackTimer?: number
  movable: boolean
  attackable = false

  attackTargetLength = 1

  traceTarget?: Unit

  healthPoint = 50
  manaPoint = 50

  constructor(private readonly contextManager: UnwrapNestedRefs<ContextManager>,
              option?: UnitOption) {
    super()
    this.attackable = option?.attackable || false
    this.movable = option?.movable || false

    this.container.x = option?.x || 0
    this.container.y = option?.y || 0


    this.attackArea.beginFill(0xFF0000)
    this.attackArea.drawCircle(0, 0, 150)
    this.attackArea.endFill()
    this.attackArea.alpha = 0
    this.container.addChild(this.attackArea)

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

    this.contextManager.on('selectUnits', (units: Unit[]) => {
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
            this.attackTargetId = undefined
            this.traceTarget = undefined
            this.movingAnimation?.pause()
            this.attackAnimation?.pause()

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

    this.contextManager.on('attackReady', (units: Unit[]) => {
      if (!this.attackable) return
      if (units.map((unit) => unit.id).includes(this.id)) {
        this.attackArea.alpha = .1
      }
    })


    if (this.movable)
      this.contextManager.on('attackStart', (attackingUnitIds: string[],
                                             attackedUnitIds: string[]) => {
        if (!this.attackable) return

        if (attackingUnitIds.includes(this.id)) {
          this.attackArea.alpha = 0

          this.movingAnimation?.pause()
          this.attackAnimation?.pause()
          this.attackTargetId = attackedUnitIds[0]
          this.traceTarget = this.contextManager.findUnit(attackedUnitIds[0])
          this.attack()
        }
      })

    if (this.attackable)
      this.contextManager.on('collideAttackArea', (unit1: Unit, unit2: Unit) => {
        if (this.id === unit1.id) {
          if (unit2.id === this.attackTargetId)
            this.attackAnimation?.pause()
          else if (!this.attackableTargetIds.includes(unit2.id)
              && !unit2.attackable) {
            this.attackableTargetIds?.push(unit2.id)
          } else if (!this.attackTargetId) {
            const targetBound = unit2.sprite.getBounds()
            const offsetX = (targetBound.x + targetBound.x + targetBound.width) / 2
            const offsetY = (targetBound.y + targetBound.y + targetBound.height) / 2

            const distance = calculateDistance(offsetX, offsetY, this.container.x, this.container.y)
            if (distance <= 150) this.attackAnimation?.pause()
          }

          this.attack()
        }
      })

    if (this.movable)
      this.contextManager.on('leaveAttackArea', (unit1, unit2) => {
        if (this.id === unit1.id
            && this.attackableTargetIds.includes(unit2.id)) {
          this.attackableTargetIds.splice(this.attackableTargetIds.indexOf(unit2.id), 1)

        }
      })
  }

  attack() {
    if (!this.attackable) return

    this.withAttackCoolTime(() => {

      const attackableTargetIds = this.sortAttackTargetByDistance()

      const attackTarget = this.attackTargetId
          ? this.contextManager.findUnit(this.attackTargetId)
          : this.contextManager.findUnit(attackableTargetIds[0])

      const index = attackableTargetIds.findIndex((id) => id === attackTarget.id)
      const deleted = attackableTargetIds.splice(index, 1)[0]

      if (deleted || attackTarget) {
        attackableTargetIds.unshift(deleted || attackTarget.id)
        const ids = attackableTargetIds.slice(0, this.attackTargetLength)
        ids.forEach((id) => {
          if (!attackTarget.attackable) {
            const target = this.contextManager.findUnit(id)
            if (this.traceAttackTarget(attackTarget) <= 150) {
              const bullet = Bullet.of(this.contextManager, this, target).render()
              setTimeout(() => bullet.remove(), 300)
            }
          }
        })
      }
    })
  }

  traceAttackTarget(attackTarget?: Unit) {
    if (!this.traceTarget && !attackTarget) return 0
    this.movingAnimation?.pause()
    this.attackAnimation?.pause()

    const targetBound = attackTarget
        ? attackTarget.sprite.getBounds()
        : this.traceTarget!.sprite.getBounds()

    const offsetX = (targetBound.x + targetBound.x + targetBound.width) / 2
    const offsetY = (targetBound.y + targetBound.y + targetBound.height) / 2
    const distance = calculateDistance(offsetX, offsetY, this.container.x, this.container.y)

    if (parseInt(String(distance)) > 150)
      this.attackAnimation = gsap.to(this.container, {
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

    return distance
  }

  sortAttackTargetByDistance() {
    return this.attackableTargetIds
        .slice()
        .sort((a, b) => {
          const thisBound = this.sprite.getBounds()


          const foundA = this.contextManager.findUnit(a)
          const foundBoundA = foundA.sprite.getBounds()
          const distanceA = calculateDistance(foundBoundA.x, foundBoundA.y, thisBound.x, thisBound.y)

          const foundB = this.contextManager.findUnit(b)
          const foundBoundB = foundB.sprite.getBounds()
          const distanceB = calculateDistance(foundBoundB.x, foundBoundB.y, thisBound.x, thisBound.y)


          return distanceA - distanceB
        })
  }

  withAttackCoolTime(cb: () => void) {
    if (!this.attackCoolTime) {
      cb()
      this.attackCoolTime = true
      clearTimeout(this.attackTimer)
      this.attackTimer = setTimeout(() => {
        this.attackCoolTime = false
      }, 1000)
    }
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