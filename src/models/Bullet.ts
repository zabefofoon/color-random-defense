import {Container, Graphics, Rectangle} from "pixi.js"
import type {UnwrapNestedRefs, UnwrapRef} from "vue"
import {ContextManager} from "@/models/ContextManager"
import type {Unit} from "@/models/Unit"
import {gsap} from "gsap"
import debounce from 'lodash.debounce'

export class Bullet {
  container = new Container()
  area = new Graphics()
  splash = true

  constructor(private readonly contextManager: UnwrapNestedRefs<ContextManager>,
              private readonly attackingUnit: Unit,
              private readonly attackedUnit: Unit) {
    const bullet = new Graphics()
    const attackingUnitBound = attackingUnit.sprite.getBounds()
    bullet.beginFill(0xFF0000)
    bullet.drawCircle(attackingUnitBound.x + (attackingUnitBound.width) / 2, attackingUnitBound.y + (attackingUnitBound.height) / 2, 5)
    bullet.endFill()
    this.container.addChild(bullet)

    this.area.beginFill(0xFF0000)
    this.area.drawCircle(attackingUnitBound.x + (attackingUnitBound.width) / 2, attackingUnitBound.y + (attackingUnitBound.height) / 2, 60)
    this.area.endFill()
    this.area.alpha = .1
    this.container.addChild(this.area)

    const containerBound = this.container.getBounds()

    const listener = () => this.updateBulletListener(containerBound)
    this.contextManager.on('updateBullet', listener)
    setTimeout(() => {
      this.contextManager.off('updateBullet', listener)
      this.remove()
      if (this.splash) this.detectCollideUnit()
      this.attackedUnit.attacked(1)
    }, 300)
  }

  updateBulletListener(containerBound: Rectangle) {
    this.shoot(containerBound)
  }

  detectCollideUnit() {
    this.contextManager
        .units
        .filter((unit) => {
          return unit.id !== this.attackingUnit.id
              && unit.id !== this.attackedUnit.id
              && this.checkCollisionUnit(unit)
        })
        .forEach((unit) => {
          const distance = this.calculateDistance(unit)

          unit.attacked(Math.max((1 / distance) * 10, 1 / 3))
        })

  }

  checkCollisionUnit(unit: Unit | UnwrapRef<Unit>) {
    const unitBound = unit.sprite.getBounds()
    const areaBound = this.area.getBounds()
    const distance = this.calculateDistance(unit)
    const range = parseInt(`${unitBound.width}`) / 2 + parseInt(`${areaBound.width}`) / 2
    return distance <= range
  }

  calculateDistance(unit: Unit | UnwrapRef<Unit>) {
    const unitBound = unit.sprite.getBounds()
    const areaBound = this.area.getBounds()

    const dx = (parseInt(`${unitBound.x}`) + parseInt(`${unitBound.x}`) + parseInt(`${unitBound.width}`)) / 2 - (parseInt(`${areaBound.x}`) + parseInt(`${areaBound.x}`) + parseInt(`${areaBound.width}`)) / 2
    const dy = (parseInt(`${unitBound.y}`) + parseInt(`${unitBound.y}`) + parseInt(`${unitBound.height}`)) / 2 - (parseInt(`${areaBound.y}`) + parseInt(`${areaBound.y}`) + parseInt(`${areaBound.height}`)) / 2
    return parseInt(String(Math.sqrt(dx * dx + dy * dy)))
  }

  shoot(containerBound: Rectangle) {
    const attackedUnitBound = this.attackedUnit.sprite.getBounds()

    gsap.to(this.container, {
      x: (attackedUnitBound.x + attackedUnitBound.width / 2) - (containerBound.x + (containerBound.width / 2)),
      y: (attackedUnitBound.y + attackedUnitBound.height / 2) - (containerBound.y + (containerBound.height / 2)),
      duration: .2,
      ease: 'linear'
    })
  }

  render() {
    if (this.container) this.contextManager.container.addChild(this.container)
    return this
  }

  remove() {
    this.contextManager.container.removeChild(this.container)
  }

  static of(contextManager: UnwrapNestedRefs<ContextManager>,
            attackingUnit: Unit,
            attackedUnit: Unit) {
    return new Bullet(contextManager, attackingUnit, attackedUnit)
  }
}