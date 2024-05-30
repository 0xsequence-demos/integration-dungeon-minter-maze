import {
  AmbientLight,
  Mesh,
  MeshPhongMaterial,
  type Object3D,
  type PerspectiveCamera,
  PointLight,
  Raycaster,
  Vector2,
} from "three";
import { Easing, Tween, update } from "three/examples/jsm/libs/tween.module.js";
import { Dungeon } from "./Dungeon";
import type { InteractiveChest } from "./InteractiveChest";
import type { MapData, MapTiles } from "./MapTypes";
import { MiniMap } from "./MiniMap";
import { PartyController } from "./PartyController";
import { PartyState } from "./PartyState";
import { STARTING_DIRECTION, STARTING_X, STARTING_Y } from "./constants";
import type { ChestData } from "./cubeColors";
import { generateChestDatas } from "./generateChestDatas";
import { isFacingLoot } from "./isFacingLoot";
import { loadMapDataFromImage } from "./loadMapDataFromImage";
import { makeChestVisuals } from "./makeChestVisuals";

// Array of button labels
const buttonLabels = ["Q", "W", "E", "A", "S", "D"];
const buttonKeyMap = {
  Q: 81,
  W: 87,
  E: 69,
  S: 83,
  A: 65,
  D: 68,
};

export class DungeonGame {
  map: MapData;
  party: PartyController;
  dungeon: Dungeon;
  buttonsContainer: HTMLDivElement;
  navButtons = new Map<string, HTMLElement>();
  partyState: PartyState;
  minimap: MiniMap;
  private _activeChest: InteractiveChest | undefined;
  public get activeChest(): InteractiveChest | undefined {
    return this._activeChest;
  }
  public set activeChest(value: InteractiveChest | undefined) {
    if (this._activeChest) {
      this._activeChest.deactivate();
    }
    this._activeChest = value;
    if (this._activeChest) {
      this._activeChest.activate();
    }
  }

  constructor(
    private pivot: Object3D,
    private camera: PerspectiveCamera,
  ) {
    const gameContainer = document.getElementById("gameContainer");

    if (!gameContainer) {
      throw new Error("Could not find dev named gameContainer");
    }
    this.gameContainer = gameContainer;
    loadMapDataFromImage("assets/textures/mini_map.png").then((map) => {
      this.map = map;
      this.init();
    });
  }
  private async init() {
    this.dungeon = new Dungeon(this.pivot, this.map);
    const partyState = new PartyState(
      STARTING_X,
      STARTING_Y,
      STARTING_DIRECTION,
    );
    this.party = new PartyController(
      this.pivot,
      this.camera,
      partyState,
      this.map,
      this.chestDatas,
    );

    this.minimap = new MiniMap(
      this.map,
      partyState,
      this.chestDatas,
      this.gameContainer,
    );

    this.party.listenForLocationChanges(() => this.minimap.render());
    this.partyState = partyState;

    // Create a container for the buttons
    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("buttons");
    this.buttonsContainer = buttonsContainer;
    // Create and append buttons
    for (const label of buttonLabels) {
      const button = document.createElement("button");
      button.classList.add("navigationButton");
      button.textContent = label;
      button.setAttribute("data-key", label);
      this.navButtons.set(label, button);

      // if (label === "") {
      //   button.id = "glass";
      //   button.style.border = "0px";
      //   button.style.top = "140px";
      //   button.style.left = "70px";
      //   button.style.height = "200px";

      //   button.style.padding = "200px";
      //   button.style.position = "fixed";
      //   button.style.outline = "none";
      //   button.style.zIndex = "100";
      // }

      button.onclick = this.onClickNavigationButton;

      buttonsContainer.appendChild(button);
    }

    generateChestDatas(this.map, this.chestDatas);

    makeChestVisuals(this.chestDatas, this.pivot, this.chests, this.camera);

    this.party.listenForLocationChanges(() => {
      const chestData = isFacingLoot(
        partyState.x,
        partyState.y,
        partyState.direction,
        this.map,
        this.chestDatas,
      );
      this.activeChest = this.chests.find((c) => c.chestData === chestData);
    });

    if (import.meta.hot) {
      import.meta.hot.accept("./makeChestVisuals", (mod) => {
        for (const chest of this.chests) {
          this.pivot.remove(chest.visuals);
        }
        this.chests.length = 0;
        const currentActiveChestData = this.activeChest?.chestData;
        mod.makeChestVisuals(
          this.chestDatas,
          this.pivot,
          this.chests,
          this.camera,
        );
        if (currentActiveChestData) {
          this.activeChest = this.chests.find(
            (c) => c.chestData === currentActiveChestData,
          );
        }
      });
    }

    this.minimap.render();

    // Add event listener for mouse click
    window.addEventListener("click", this.onMouseClick, false);

    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);

    // Append the container to the body
    document.body.appendChild(buttonsContainer);

    const ambientLight = new AmbientLight(0x08131c);
    this.pivot.add(ambientLight);

    // this.party.light.shadow.mapSize.setScalar(1024);
    // party.light.castShadow = true
  }

  chests: InteractiveChest[] = [];
  raycaster = new Raycaster();
  mouse = new Vector2();
  chestDatas: ChestData[] = [];

  gameContainer: HTMLElement;

  onClickNavigationButton = (event) => {
    const keyLabel = event.target.textContent;

    if (keyLabel in buttonKeyMap) {
      const key_code = buttonKeyMap[keyLabel];
      if (this.party) {
        this.party.handleKey(key_code);
      }

      const keyChar = String.fromCharCode(key_code);
      const button = this.navButtons.get(keyChar);
      if (button) {
        button.style.background = "grey";
        setTimeout(() => {
          button.style.background = "black";
        }, 200);
      }
    }
  };

  onKeyDown = (e: KeyboardEvent) => {
    const key = e.keyCode ? e.keyCode : e.which;
    if (this.party) {
      this.party.handleKey(key);
    }
    const keyChar = String.fromCharCode(key);
    const button = this.navButtons.get(keyChar);
    if (button) {
      button.style.background = "grey";
    }
  };
  onKeyUp = (e: KeyboardEvent) => {
    const key = e.keyCode ? e.keyCode : e.which;
    const keyChar = String.fromCharCode(key);
    const button = this.navButtons.get(keyChar);
    if (button) {
      button.style.background = "black";
    }
  };

  onMouseClick = (event: MouseEvent) => {
    // Calculate mouse position in normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Calculate objects intersecting the picking ray
    const intersects = this.raycaster.intersectObjects(this.pivot.children);

    // for (let i = 0; i < intersects.length; i++) {
    //   if (
    //     intersects[i].object.name.slice(0, 4) === "loot" &&
    //     intersects[i].distance < 1
    //   ) {
    //     window.parent.postMessage(
    //       { portal: "loot", color: intersects[i].object.userData.color },
    //       "https://dungeon-minter.vercel.app/",
    //     );

    //     this.chestDatas = this.chestDatas.filter((cell) => {
    //       if (
    //         String(cell.id) !== String(intersects[i].object.userData.loot_id)
    //       ) {
    //         return true;
    //       }
    //       return false;
    //     });
    //     // this.pivot.remove(intersects[i].object);
    //     intersects[i].object.traverse((n) => {
    //       if (n.parent && n instanceof PointLight) {
    //         n.parent.remove(n);
    //       }
    //       if (
    //         n.name === "glow" &&
    //         n instanceof Mesh &&
    //         n.material instanceof MeshPhongMaterial
    //       ) {
    //         n.material.emissive.multiplyScalar(0.02);
    //       } else if (n.name === "lid") {
    //         new Tween(n.rotation)
    //           .to({ x: -1 }, 1000)
    //           .easing(Easing.Sinusoidal.InOut)
    //           .start();
    //       }
    //     });
    //     this.minimap.render();
    //   }
    // }
  };

  time = 0;
  simulate = (dt: number) => {
    update(); //TWEENER
    this.time += dt;
    if (this.party) {
      this.party.tick();
    }
  };
  cleanup = () => {
    window.removeEventListener("click", this.onMouseClick);
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("keyup", this.onKeyUp);
    document.body.removeChild(this.buttonsContainer);
  };
}
