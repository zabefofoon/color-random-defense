import {Container, DisplayObject, Graphics, Sprite, Text, TextStyle, Texture} from "pixi.js"
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

  state = ''

  healthPoint = 50
  manaPoint = 50

  constructor(private readonly contextManager: UnwrapNestedRefs<ContextManager>,
              option?: UnitOption) {
    super()
    const textStyle = new TextStyle({
      fontSize: 20,
      align: 'center'
    })
    const text = new Text(this.id.slice(0, 3), textStyle)
    text.x = -text.width / 2
    this.container.addChild(text)

    const hp = new Text(this.healthPoint, textStyle)
    text.x = -text.width / 2
    text.y = -20
    this.container.addChild(hp)

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
    sprite.width = 40
    sprite.height = 40
    sprite.x = -sprite.width / 2
    sprite.y = -sprite.height / 2
    sprite.eventMode = 'static'


    sprite.on('mouseover', () => {
      this.preselectedIndicator.lineStyle(2, 0xFF00FF, .3)
      this.preselectedIndicator.drawCircle(0, 0, sprite.width / 2)
      this.container.addChild(this.preselectedIndicator)
    })

    sprite.on('mouseleave', () => {
      this.container.removeChild(this.preselectedIndicator)
    })

    this.contextManager.on('updateBullet', () => {

      hp.text = this.attackable
          ? String(this.attackCoolTime)
          : this.healthPoint.toFixed(1)
    })

    this.container.addChild(sprite)

    this.contextManager.on('selectUnits', (units: Unit[]) => {
      if (units.map((unit) => unit.id).includes(this.id)) {
        this.selectedIndicator.lineStyle(2, 0xFF00FF)
        this.selectedIndicator.drawCircle(0, 0, sprite.width / 2)
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
        const containerBound = this.container.getBounds()
        const unit2Bound = unit2.container.getBounds()
        const thisCenterX = containerBound.x + containerBound.width / 2
        const anotherCenterX = unit2Bound.x + unit2Bound.width / 2
        const thisCenterY = containerBound.y + containerBound.height / 2
        const anotherCenterY = unit2Bound.y + unit2Bound.height / 2

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
            const distance = parseInt(String(calculateDistance(offsetX, offsetY, this.container.x, this.container.y)))

            this.movingAnimation = gsap.to(this.container, {
              x: offsetX,
              y: offsetY,
              duration: distance / 250,
              ease: 'linear',
            })
            this.state = 'moving'
            setTimeout(() => this.state = 'moveend', (distance / 250) * 1000)

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
        }
      })

    if (this.attackable)
      this.contextManager.on('collideAttackArea', (unit1: Unit, unit2: Unit) => {
        if (this.id !== unit1.id) return

        if (!this.attackableTargetIds.includes(unit2.id) &&
            !unit2.attackable)
          this.attackableTargetIds?.push(unit2.id)

        if (unit2.id === this.traceTarget?.id) {
          this.state = 'traceend'
        }
      })

    if (this.movable)
      this.contextManager.on('leaveAttackArea', (unit1, unit2) => {
        if (this.id === unit1.id &&
            this.attackableTargetIds.includes(unit2.id)) {
          this.attackableTargetIds.splice(this.attackableTargetIds.indexOf(unit2.id), 1)
        }
      })
  }

  attack() {
    if (this.state === 'moving') return
    if (this.traceTarget) {
      !this.attackableTargetIds.includes(this.traceTarget.id)
          ? this.traceAttackTarget(this.traceTarget)
          : this.withAttackCoolTime(() => {
            this.sortAttackTargetByDistance()
                .slice(0, this.attackTargetLength)
                .forEach((id) => {
                  Bullet.of(this.contextManager, this, this.contextManager.findUnit(id)).render()
                })
          })
    } else {
      if (this.attackableTargetIds.length) {
        const attackableTargetIds = this.sortAttackTargetByDistance()
        const attackTarget = this.contextManager.findUnit(attackableTargetIds[0])
        if (!attackTarget) return
        this.traceAttackTarget(attackTarget)
        this.withAttackCoolTime(() => {
          attackableTargetIds
              .slice(0, this.attackTargetLength)
              .forEach((id) => {
                Bullet.of(this.contextManager, this, this.contextManager.findUnit(id)).render()
              })
        })
      }
    }
  }

  attacked(damage: number) {
    this.healthPoint = this.healthPoint - damage
  }

  traceAttackTarget(attackTarget?: Unit) {
    const targetBound = attackTarget
        ? attackTarget.sprite.getBounds()
        : this.traceTarget!.sprite.getBounds()

    const offsetX = (targetBound.x + targetBound.x + targetBound.width) / 2
    const offsetY = (targetBound.y + targetBound.y + targetBound.height) / 2
    const distance = parseInt(String(calculateDistance(offsetX, offsetY, this.container.x, this.container.y)))

    if (distance > 150 &&
        this.state !== 'tracing' &&
        !this.attackCoolTime) {
      this.attackAnimation = gsap.to(this.container, {
        x: offsetX,
        y: offsetY,
        duration: distance / 250,
        ease: 'linear',
      })
      this.state = 'tracing'
    }

    const angleDegrees = Math.atan2(offsetY - this.container.y, offsetX - this.container.x) * (180 / Math.PI) + 90

    gsap.to(this.container, {
      rotation: (Math.PI / 180) * angleDegrees,
      duration: .1,
      ease: 'linear'
    })
  }

  sortAttackTargetByDistance() {
    const ids = this.attackableTargetIds
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


    const index = ids.findIndex((id) => id === this.traceTarget?.id)
    if (index !== -1) {
      const deleted = ids.splice(index, 1)[0]
      ids.unshift(deleted)
    }


    return ids
  }

  withAttackCoolTime(cb: () => void) {
    if (this.attackCoolTime) return
    this.attackAnimation?.pause()
    cb()
    this.attackCoolTime = true

    this.attackTimer = setTimeout(() => {
      this.attackCoolTime = false
      clearTimeout(this.attackTimer)
    }, 1000)
  }

  get sprite() {
    return this.container.children.find((child) => child instanceof Sprite)!
  }

  render() {
    if (this.container) this.contextManager.map.container.addChild(this.container)
    return this
  }

  static of(contextManager: UnwrapNestedRefs<ContextManager>,
            option?: UnitOption) {
    return new Unit(contextManager, option)
  }
}