import { SphereGeometry } from "three";
import { PointLight } from "three";
import {
  AmbientLight,
  BoxGeometry,
  Mesh,
  MeshPhongMaterial,
  type Object3D,
  type PerspectiveCamera,
  Raycaster,
  Vector2,
} from "three";
import { update } from "three/examples/jsm/libs/tween.module.js";
import { Dungeon } from "./Dungeon";
import { MapTiles } from "./MapTiles";
import type { Party } from "./Party";
import { STARTING_X, STARTING_Y } from "./constants";
import { type ColoredCell, colors, hex_colors } from "./cubeColors";
import { Direction, asDegrees } from "./directionUtils";

// Array of button labels
const buttonLabels = ["Q", "W", "E", "A", "S", "D"];
const keyMap = {
  Q: 81,
  W: 87,
  E: 69,
  S: 83,
  A: 65,
  D: 68,
};

const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);

const refresh = params.get("refresh");

const gridSize = 9; // This sets the grid size to 9x9

export class DungeonGame {
  party: Party;
  dungeon: Dungeon;
  buttonsContainer: HTMLDivElement;
  navButtons = new Map<string, HTMLElement>();

  constructor(
    private pivot: Object3D,
    private camera: PerspectiveCamera,
  ) {
    const gameContainer = document.getElementById("gameContainer");

    if (!gameContainer) {
      throw new Error("Could not find dev named gameContainer");
    }
    this.gameContainer = gameContainer;
    this.dungeon = new Dungeon(pivot, camera);
    this.dungeon.loadMap("assets/textures/mini_map.png").then(this.init);
  }
  private init = () => {
    if (refresh === "true") {
      this.party = this.dungeon.spawnParty(
        Number(localStorage.getItem("x")),
        Number(localStorage.getItem("y")),
        Number(localStorage.getItem("direction-1")),
      );
    } else {
      this.party = this.dungeon.spawnParty(
        STARTING_X,
        STARTING_Y,
        Direction.NORTH,
      );
    }
    this.party.positionListeners.push(this.renderMap);

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
    let index = 0;
    const map = this.dungeon.map;
    for (let i = 0; i < map.length; i++) {
      for (let j = 0; j < map[i].length; j++) {
        if (Math.random() < 0.1 && map[i][j] !== MapTiles.wall) {
          // 10% chance to assign a color
          const colorIndex = Math.floor(Math.random() * hex_colors.length);
          this.coloredCells.push({
            x: i,
            y: j,
            color: hex_colors[colorIndex],
            color_loot: colors[colorIndex],
            id: index,
          });
          index++;
          if (this.coloredCells.length === 10) break;
        }
      }
      if (this.coloredCells.length === 10) break;
    }

    const geometry = new BoxGeometry(0.3, 0.3, 0.3);

    for (let i = 0; i < this.coloredCells.length; i++) {
      const material = new MeshPhongMaterial({
        color: this.coloredCells[i].color_loot,
        emissive: this.coloredCells[i].color_loot,
        shininess: 100,
      });

      const cube = new Mesh(geometry, material);
      // cube.castShadow = true;

      // Select a random valid position
      if (this.coloredCells.length > 0) {
        // let randomIndex = Math.floor(Math.random() * validPositions.length);
        // let position = validPositions[randomIndex];

        // validPositions.splice(randomIndex, 1);
        const position = this.coloredCells[i];
        cube.userData.loot_id = i;
        cube.position.x = position.y;
        cube.position.z = position.x;
      }

      cube.position.y = 0.31;
      cube.userData.id = i;
      cube.name = "loot"; //portal
      cube.userData.color = this.coloredCells[i].color;

      const cubeLight = new PointLight(this.coloredCells[i].color, 0.6, 3);
      // cubeLight.castShadow = true
      cube.add(cubeLight);
      this.pivot.add(cube);
      this.cubes.push(cube);
    }

    this.renderMap();

    // Add event listener for mouse click
    window.addEventListener("click", this.onMouseClick, false);

    document.addEventListener("keydown", this.onNavKeyDown);
    document.addEventListener("keyup", this.onNavKeyUp);

    // Append the container to the body
    document.body.appendChild(buttonsContainer);

    const ambientLight = new AmbientLight(0x08131c);
    this.pivot.add(ambientLight);

    this.party.light.shadow.mapSize.setScalar(1024);
    // party.light.castShadow = true
  };

  cubes: Mesh[] = [];
  raycaster = new Raycaster();
  mouse = new Vector2();
  coloredCells: ColoredCell[] = [];

  gameContainer: HTMLElement;

  calculateBounds() {
    const halfSize = Math.floor(gridSize / 2);
    const startX = Math.max(
      0,
      Math.min(
        this.party.position.x - halfSize,
        this.dungeon.map[0].length - gridSize,
      ),
    );
    const startY = Math.max(
      0,
      Math.min(
        this.party.position.y - halfSize,
        this.dungeon.map.length - gridSize,
      ),
    );
    return { startX, startY };
  }

  renderMap = () => {
    if (document.getElementById("mini-map")) {
      document.getElementById("mini-map")?.remove();
    }
    const { startX, startY } = this.calculateBounds();
    const miniMap = document.createElement("div");
    miniMap.id = "mini-map";
    miniMap.className = "mini-map";
    for (let i = startY; i < startY + gridSize; i++) {
      const rowDiv = document.createElement("div");
      rowDiv.className = "row";
      for (let j = startX; j < startX + gridSize; j++) {
        const cell = this.dungeon.map[i][j];
        const cellDiv = document.createElement("div");
        cellDiv.className = "cell";
        if (cell === MapTiles.wall) cellDiv.classList.add("obstacle");

        if (i === this.party.position.y && j === this.party.position.x) {
          const playerMarker = document.createElement("div");
          playerMarker.className = "player-marker";
          playerMarker.style.transform = `translate(-50%, -50%) rotate(${asDegrees(
            this.party.direction,
          )}deg)`;
          cellDiv.appendChild(playerMarker);
        }
        const coloredCell = this.coloredCells.find(
          (loot) => loot.x === i && loot.y === j,
        );
        if (coloredCell) {
          const colorDiv = document.createElement("div");
          colorDiv.className = "color-marker";
          colorDiv.style.backgroundColor = coloredCell.color;
          cellDiv.appendChild(colorDiv);
        }
        rowDiv.appendChild(cellDiv);
      }
      miniMap.appendChild(rowDiv);
    }

    this.gameContainer.innerHTML = "";
    this.gameContainer.appendChild(miniMap);
  };

  onClickNavigationButton = (event) => {
    const keyLabel = event.target.textContent;

    if (keyLabel in keyMap) {
      const key_code = keyMap[keyLabel];
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

  findValidPositions(startX: number, startY: number, radius: number) {
    const map = this.dungeon.map;
    const positions_x: number[] = [];
    const positions_z: number[] = [];
    const validPositions: { x: number; z: number }[] = [];
    const minX = Math.max(startX - radius, 0);
    const maxX = Math.min(startX + radius, map[0].length - 1);
    const minZ = Math.max(startY - radius, 0);
    const maxZ = Math.min(startY + radius, map.length - 1);

    for (let z = 0; z < map.length; z++) {
      for (let x = 0; x < map[z].length; x++) {
        if (map[z][x] !== MapTiles.wall) {
          // Check if within the computed ranges
          if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
            // Add to positions if within the radius for x or z
            positions_x.push(x);
            positions_z.push(z);
          }
        }
      }
    }

    for (let z = 0; z < map.length; z++) {
      for (let x = 0; x < map[z].length; x++) {
        if (map[z][x] === 1) {
          // Check if within the computed ranges
          if (!positions_x.includes(x) && !positions_z.includes(z)) {
            // Add to positions if within the radius for x or z
            validPositions.push({ x, z });
          }
        }
      }
    }
    return validPositions;
  }

  onNavKeyDown = (e: KeyboardEvent) => {
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
  onNavKeyUp = (e: KeyboardEvent) => {
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

    for (let i = 0; i < intersects.length; i++) {
      if (
        intersects[i].object.name.slice(0, 4) === "loot" &&
        intersects[i].distance < 1
      ) {
        window.parent.postMessage(
          { portal: "loot", color: intersects[i].object.userData.color },
          "https://dungeon-minter.vercel.app/",
        );

        this.coloredCells = this.coloredCells.filter((cell) => {
          if (
            String(cell.id) !== String(intersects[i].object.userData.loot_id)
          ) {
            return true;
          }
          return false;
        });
        this.pivot.remove(intersects[i].object);
        this.renderMap();
      }
    }
  };

  time = 0;
  simulate = (dt: number) => {
    update(); //TWEENER
    this.time += dt;

    for (const cube of this.cubes) {
      cube.rotation.x += 0.02;
      cube.rotation.y += 0.0187;
      // cubeLight.intensity = 0.1 * Math.sin(time * 0.002) + 0.6;
      cube.position.y = 0.1 * Math.sin(this.time * 0.001) + 0.41;
    }
    if (this.party) {
      this.party.tick();
    }
  };
  cleanup = () => {
    window.removeEventListener("click", this.onMouseClick);
    document.removeEventListener("keydown", this.onNavKeyDown);
    document.removeEventListener("keyup", this.onNavKeyUp);
    document.body.removeChild(this.buttonsContainer);
  };
}
