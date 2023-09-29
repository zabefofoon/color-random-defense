import {Container, Graphics} from "pixi.js"
import type {UnwrapNestedRefs} from "vue"
import {ContextManager} from "@/models/ContextManager"
import type {Unit} from "@/models/Unit"
import {gsap} from "gsap"

export class Bullet {
  container = new Container()

  constructor(private readonly contextManager: UnwrapNestedRefs<ContextManager>,
              private readonly attackingUnit: Unit,
              private readonly attackedUnit: Unit) {
    const bullet = new Graphics()
    const attackingUnitBound = attackingUnit.sprite.getBounds()
    bullet.beginFill(0xFF0000)
    bullet.drawCircle(attackingUnitBound.x + (attackingUnitBound.width) / 2, attackingUnitBound.y + (attackingUnitBound.height) / 2, 5)
    bullet.endFill()
    this.container.addChild(bullet)

    const attackedUnitBound = this.attackedUnit.sprite.getBounds()
    const containerBound = this.container.getBounds()

    const listener = () => {
      gsap.to(this.container, {
        x: (attackedUnitBound.x + attackedUnitBound.width / 2) - (containerBound.x + (containerBound.width / 2)),
        y: (attackedUnitBound.y + attackedUnitBound.height / 2) - (containerBound.y + (containerBound.height / 2)),
        duration: .1,
        ease: 'linear'
      })
    }
    this.contextManager.on('updateBullet', listener)
    setTimeout(() => this.contextManager.off('updateBullet', listener), 500)
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