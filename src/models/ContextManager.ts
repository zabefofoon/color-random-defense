import {Unit} from "@/models/Unit"
import type {UnitOption} from "@/models/Unit"
import {EventEmitter} from "events"
import {Application} from "pixi.js"
import {gsap} from 'gsap'
import {calculateDistance} from "@/utils/util"
import {SelectArea} from "@/models/SelectArea"

export class ContextManager extends EventEmitter {
  selectedUnits: Unit[] = []

  units: Unit[] = []

  app?: Application

  selectArea: SelectArea

  constructor(app: Application) {
    super()
    this.app = app
    this.selectArea = SelectArea.of(this, this.app)
  }

  move({offsetX, offsetY}: MouseEvent) {
    this.selectedUnits.forEach(({sprite}) => {
      const distance = calculateDistance(offsetX, offsetY, sprite.x, sprite.y)
      gsap.to(sprite, {
        x: offsetX - 12.5,
        y: offsetY - 12.5,
        duration: distance / 250,
        ease: 'linear'
      })
    })
  }

  selectUnits(units: Unit[]) {
    this.selectedUnits = units
    this.emit('selectedUnits', units)
  }

  createUnit(option: UnitOption) {
    if (this.app)  {
      const unit = Unit.of(this, option).render(this.app.stage)
      this.units.push(unit)
    }
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