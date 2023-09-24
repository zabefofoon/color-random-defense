import type {UnitOption} from "@/models/Unit"
import {Unit} from "@/models/Unit"
import {EventEmitter} from "events"
import {Application, Container} from "pixi.js"
import {checkCollisionAttackAreaWithUnit, checkCollisionUnitWithUnit, checkCollisionUnitWithWall} from "@/utils/util"
import {SelectArea} from "@/models/SelectArea"
import {Wall} from "@/models/Wall"

export class ContextManager extends EventEmitter {
  selectedUnits: Unit[] = []

  units: Unit[] = []

  selectArea: SelectArea

  walls: Wall[] = []

  container = new Container()

  isAttackReady = false

  constructor(public readonly app: Application) {
    super()
    this.app = app
    this.app.stage.addChild(this.container)
    this.selectArea = SelectArea.of(this, this.app)
  }

  emitKeydown({code}: KeyboardEvent) {
    if (code === 'KeyA') {
      this.attackReady()
    }
  }

  attackReady() {
    if (this.selectedUnits.length) {
      this.isAttackReady = true
      this.emit('attackReady', this.selectedUnits)
    }
  }

  attackStart(attackingUnitIds: string[],
              attackedUnitIds: string[]) {
    this.emit('attackStart', attackingUnitIds, attackedUnitIds)
    this.isAttackReady = false

    const attackingUnits = this.units.filter((unit) => attackingUnitIds.includes(unit.id))
    this.selectUnits(attackingUnits)
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

  detectCollideAttackArea() {
    this.units.forEach((unit1) => {
      this.units.forEach((unit2) => {
        if (unit1 !== unit2)
          if (checkCollisionAttackAreaWithUnit(unit1, unit2)) {
            this.emit('collideAttackArea', unit1, unit2)
          } else
            this.emit('leaveAttackArea', unit1, unit2)
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
    this.emit('selectUnits', units)
  }

  createUnit(option: UnitOption) {
    if (!this.app) return
    const unit = Unit.of(this, option).render()
    this.units.push(unit)
    return unit
  }

  createWall(option: UnitOption) {
    if (!this.app) return
    const wall = Wall.of(this, option).render()
    this.walls.push(wall)
    return wall
  }

  emitMousedown(event: MouseEvent) {
    this.emit('mousedown', event)
  }

  emitMouseup(event: MouseEvent) {
    const attackingUnitIds = this.selectedUnits.map((unit) => unit.id)
    this.emit('mouseup', event)
    const attackedUnitIds = this.selectedUnits.map((unit) => unit.id)

    if (this.isAttackReady)
      this.attackStart(attackingUnitIds, attackedUnitIds)
  }

  emitMousemove(event: MouseEvent) {
    this.emit('mousemove', event)
  }

  findUnit(unitId: string) {
    return this.units.find((unit) => unit.id === unitId)!
  }

  static of(app: Application) {
    return new ContextManager(app)
  }
}