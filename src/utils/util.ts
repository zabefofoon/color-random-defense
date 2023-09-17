import ShortUniqueId from "short-unique-id"
import {Sprite} from "pixi.js"
import type {RectCoords} from "@/models/SelectArea"
import type {Unit} from "@/models/Unit"
import type {UnwrapRef} from "vue"

export type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

export const generateUniqueId = (): string => new ShortUniqueId({dictionary: 'alpha'}).randomUUID(10)

export const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

export const calculateDistance = (x1: number,
                                  y1: number,
                                  x2: number,
                                  y2: number) => Math.sqrt(Math.pow( x2 - x1, 2) + Math.pow(y2 - y1, 2))

export const checkRectIntersectRectCoords = ({x1, y1, x2, y2}: RectCoords,
                                             rect: Sprite | UnwrapRef<Unit["sprite"]>,
                                             adjustRectX?: number,
                                             adjustRectY?: number) => {
  const x2Left = rect.x + (adjustRectX || 0)
  const x2Right = x2Left + rect.width
  const y2Top = rect.y + (adjustRectY || 0)
  const y2Bottom = y2Top + rect.height

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