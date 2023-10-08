import type {ContextManager} from "@/models/ContextManager"

export const generateWalls = (contextManager: ContextManager) => {
  contextManager.createWall({
    x: 925,
    y: 450,
    width: 150,
    height: 10
  })

  contextManager.createWall({
    x: 925,
    y: 450,
    width: 10,
    height: 150,
  })

  contextManager.createWall({
    x: 925,
    y: 750,
    width: 10,
    height: 150,
  })

  contextManager.createWall({
    x: 925,
    y: 890,
    width: 150,
    height: 10,
  })

  contextManager.createWall({
    x: 1200,
    y: 450,
    width: 150,
    height: 10,
  })

  contextManager.createWall({
    x: 1340,
    y: 450,
    width: 10,
    height: 150,
  })

  contextManager.createWall({
    x: 1200,
    y: 890,
    width: 150,
    height: 10,
  })

  contextManager.createWall({
    x: 1340,
    y: 750,
    width: 10,
    height: 150,
  })


  contextManager.createWall({
    x: 737.5,
    y: 275,
    width: 10,
    height: 800,
  })

  contextManager.createWall({
    x: 737.5,
    y: 275,
    width: 800,
    height: 10,
  })

  contextManager.createWall({
    x: 1527.5,
    y: 275,
    width: 10,
    height: 800,
  })

  contextManager.createWall({
    x: 737.5,
    y: 1065,
    width: 800,
    height: 10,
  })
}