import type {UnitOption} from "@/models/Unit"
import {Unit} from "@/models/Unit"
import {EventEmitter} from "events"
import {Application} from "pixi.js"
import {checkRectIntersectRectCoords} from "@/utils/util"
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

  move(event: MouseEvent) {
    this.emit('move', event)
  }

  detectCollideWall() {
    this.units.forEach((unit) => {
      this.immobileArea.forEach((immobileArea) => {
        if (checkRectIntersectRectCoords(immobileArea, unit.sprite))
          this.emit('collideWall', unit, immobileArea)
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