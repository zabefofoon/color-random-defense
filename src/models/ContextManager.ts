import type {UnitOption} from "@/models/Unit"
import {Unit} from "@/models/Unit"
import {EventEmitter} from "events"
import {Application} from "pixi.js"
import {checkCollisionUnitWithUnit, checkCollisionUnitWithWall} from "@/utils/util"
import type {RectCoords} from "@/models/SelectArea"
import {SelectArea} from "@/models/SelectArea"
import {Wall} from "@/models/Wall"

export class ContextManager extends EventEmitter {
  selectedUnits: Unit[] = []

  units: Unit[] = []

  app?: Application

  selectArea: SelectArea

  walls: Wall[] = []

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
      this.walls.forEach((wall) => {
        if (checkCollisionUnitWithWall(unit, wall))
          this.emit('collideWall', unit, wall)
      })
    })
  }

  detectCollideCircle() {
    this.units.forEach((unit1) => {
      this.units.forEach((unit2) => {
        if (unit1 !== unit2 && checkCollisionUnitWithUnit(unit1, unit2))
          this.emit('collideUnits', unit1, unit2)
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
    this.walls.push(wall)
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