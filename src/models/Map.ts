import {Application, Container, Sprite, Texture} from "pixi.js"
import type {UnwrapNestedRefs} from "vue"
import {ContextManager} from "@/models/ContextManager"
import map from "@/assets/map.png"

export class Map {
  sprite = new Sprite(Texture.from(map))
  container = new Container()

  constructor(private readonly contextManager: UnwrapNestedRefs<ContextManager>,
              private readonly app: Application) {


    this.container.width = 2500
    this.container.height = 2500
    this.sprite.width = 2500
    this.sprite.height = 2500
    this.sprite.alpha = .05

    this.container.addChild(this.sprite)
    this.app.stage.addChild(this.container)
  }

  static of(contextManager: UnwrapNestedRefs<ContextManager>,
            app: Application) {
    return new Map(contextManager, app)
  }
}
