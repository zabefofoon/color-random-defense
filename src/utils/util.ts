import ShortUniqueId from "short-unique-id"

export type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

export const generateUniqueId = (): string => new ShortUniqueId({dictionary: 'alpha'}).randomUUID(10)

export const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value))

export const calculateDistance = (x1: number,
                                  y1: number,
                                  x2: number,
                                  y2: number) => Math.sqrt(Math.pow( x2 - x1, 2) + Math.pow(y2 - y1, 2))