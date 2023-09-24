import ShortUniqueId from "short-unique-id"
import {Sprite} from "pixi.js"
import type {RectCoords} from "@/models/SelectArea"
import type {Unit} from "@/models/Unit"
import type {UnwrapRef} from "vue"
import {Wall} from "@/models/Wall"

export type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T]

export const generateUniqueId = (): string => new ShortUniqueId({dictionary: 'alpha'}).randomUUID(10)

export const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

export const calculateDistance = (x1: number,
                                  y1: number,
                                  x2: number,
                                  y2: number) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))

export const checkRectIntersectRectCoords = ({x1, y1, x2, y2}: RectCoords,
                                             rect: Sprite | UnwrapRef<Unit["sprite"]>,) => {
  const x2Left = rect.getBounds().x
  const x2Right = x2Left + rect.getBounds().width
  const y2Top = rect.getBounds().y
  const y2Bottom = y2Top + rect.getBounds().height

  // 첫 번째 사각형의 좌측 상단 점
  const x1Left = Math.min(x1, x2)
  const y1Top = Math.min(y1, y2)

  // 첫 번째 사각형의 우측 하단 점
  const x1Right = Math.max(x1, x2)
  const y1Bottom = Math.max(y1, y2)

  return x2 !== -1 &&
      y2 !== -1 &&
      x2Left <= x1Right &&
      x2Right >= x1Left &&
      y2Top <= y1Bottom &&
      y2Bottom >= y1Top
}

export const checkCollisionUnitWithWall = (unit: Unit, wall: Wall) => {
  const unitBounds = unit.sprite.getBounds()
  const wallBounds = wall.sprite.getBounds()

  // Bounding Box 간의 충돌 검사
  const unitRight = unitBounds.x + unitBounds.width
  const wallRight = wallBounds.x + wallBounds.width
  const unitBottom = unitBounds.y + unitBounds.height
  const wallBottom = wallBounds.y + wallBounds.height

  return (
      unitRight >= wallBounds.x &&
      unitBounds.x <= wallRight &&
      unitBottom >= wallBounds.y &&
      unitBounds.y <= wallBottom
  )
}

export const checkCollisionUnitWithUnit = (unitA: Unit, unitB: Unit) => {
  const dx = (parseInt(`${unitA.sprite.getBounds().x}`) + parseInt(`${unitA.sprite.getBounds().x}`) + parseInt(`${unitA.sprite.getBounds().width}`)) / 2 - (parseInt(`${unitB.sprite.getBounds().x}`) + parseInt(`${unitB.sprite.getBounds().x}`) + parseInt(`${unitB.sprite.getBounds().width}`)) / 2
  const dy = (parseInt(`${unitA.sprite.getBounds().y}`) + parseInt(`${unitA.sprite.getBounds().y}`) + parseInt(`${unitA.sprite.getBounds().height}`)) / 2 - (parseInt(`${unitB.sprite.getBounds().y}`) + parseInt(`${unitB.sprite.getBounds().y}`) + parseInt(`${unitB.sprite.getBounds().height}`)) / 2
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance <= parseInt(`${unitA.sprite.getBounds().width}`) / 2 + parseInt(`${unitB.sprite.getBounds().width}`) / 2
}

export const checkCollisionAttackAreaWithUnit = (unitA: Unit, unitB: Unit) => {
  const dx = (parseInt(`${unitA.attackArea.getBounds().x}`) + parseInt(`${unitA.attackArea.getBounds().x}`) + parseInt(`${unitA.attackArea.getBounds().width}`)) / 2 - (parseInt(`${unitB.sprite.getBounds().x}`) + parseInt(`${unitB.sprite.getBounds().x}`) + parseInt(`${unitB.sprite.getBounds().width}`)) / 2
  const dy = (parseInt(`${unitA.attackArea.getBounds().y}`) + parseInt(`${unitA.attackArea.getBounds().y}`) + parseInt(`${unitA.attackArea.getBounds().height}`)) / 2 - (parseInt(`${unitB.sprite.getBounds().y}`) + parseInt(`${unitB.sprite.getBounds().y}`) + parseInt(`${unitB.sprite.getBounds().height}`)) / 2
  const distance = Math.sqrt(dx * dx + dy * dy)
  return distance <= parseInt(`${unitA.attackArea.getBounds().width}`) / 2 + parseInt(`${unitB.sprite.getBounds().width}`) / 2
}