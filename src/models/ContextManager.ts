import type {UnitOption} from "@/models/Unit"
import {Unit} from "@/models/Unit"
import {EventEmitter} from "events"
import {Application} from "pixi.js"
import {gsap} from 'gsap'
import {calculateDistance, checkRectIntersectRectCoords} from "@/utils/util"
import type {RectCoords} from "@/models/SelectArea"
import {SelectArea} from "@/models/SelectArea"
import {Wall} from "@/models/Wall"

export class ContextManager extends EventEmitter {
  selectedUnits: Unit[] = []

  units: Unit[] = []

  app?: Application

  selectArea: SelectArea
  immobileArea: RectCoords[] = []

  constructor(app: Application) {
    super()
    this.app = app
    this.selectArea = SelectArea.of(this, this.app)
  }

  move({offsetX, offsetY}: MouseEvent) {
    this.selectedUnits.forEach(({sprite}) => {
      const distance = calculateDistance(offsetX, offsetY, sprite.x, sprite.y)


      gsap.to(sprite, {
        x: offsetX,
        y: offsetY,
        duration: distance / 250,
        ease: 'linear'
      })

      const angleDegrees = Math.atan2(offsetY - sprite.y, offsetX - sprite.x) * (180 / Math.PI) + 90

      gsap.to(sprite, {
        rotation: (Math.PI / 180) * angleDegrees,
        duration: .1,
        ease: 'linear'
      })
    })
  }

  detectCollide() {
    this.units.forEach((unit) => {
      this.immobileArea.forEach((immobileArea) => {
        if (checkRectIntersectRectCoords(immobileArea, unit.sprite)) {
          alert(unit.id)
        }
      })
    })
  }

  selectUnits(units: Unit[]) {
    this.selectedUnits = units
    this.emit('selectedUnits', units)
  }

  createUnit(option: UnitOption) {
    if (!this.app) return
    const unit = Unit.of(this, option).render(this.app.stage)
    this.units.push(unit)
  }

  createWall(option: UnitOption) {
    if (!this.app) return
    const wall = Wall.of(this, option).render(this.app.stage)
    this.immobileArea.push(wall.createImmobileArea())
  }

  emitMousedown(event: MouseEvent) {
    this.emit('mousedown', event)
  }

  emitMouseup(event: MouseEvent) {
    this.emit('mouseup', event)
  }

  emitMousemove(event: MouseEvent) {
    this.emit('mousemove', event)
  }

  static of(app: Application) {
    return new ContextManager(app)
  }
}