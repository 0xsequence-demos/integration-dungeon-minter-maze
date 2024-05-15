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
import type { Party } from "./Party";
import { STARTING_X, STARTING_Y } from "./constants";
import { type ColoredCell, colors, hex_colors } from "./cubeColors";
import { Direction } from "./directionUtils";

// Array of button labels
const buttonLabels = ["Q", "W", "E", "A", "S", "D", ""];

const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);

const refresh = params.get("refresh");

const gridSize = 9; // This sets the grid size to 9x9

export class Game {
	party: Party | undefined;
	dungeon: Dungeon;
	buttonsContainer: HTMLDivElement;

	constructor(
		private pivot: Object3D,
		private camera: PerspectiveCamera,
	) {
		this.dungeon = new Dungeon(pivot, camera);
		this.dungeon.loadMap("/textures/mini_map.png").then(() => {
			this.init();
		});
	}
	initd = false;
	private init() {
		if (this.initd) {
			return;
		}
		this.initd = true;
		document.addEventListener("keydown", this.handleKeyPress);
		// Create a container for the buttons
		const buttonsContainer = document.createElement("div");
		this.buttonsContainer = buttonsContainer;
		buttonsContainer.style.position = "fixed";
		buttonsContainer.style.bottom = "10px";
		buttonsContainer.style.left = "20px";
		buttonsContainer.style.margin = "10px";
		buttonsContainer.style.display = "grid";
		buttonsContainer.style.gridTemplateColumns = "repeat(3, 1fr)"; // 3 columns
		buttonsContainer.style.gridTemplateRows = "repeat(2, 1fr)"; // 2 rows
		buttonsContainer.style.gap = "5px";
		buttonsContainer.style.width = "150px"; // Set a fixed width for the container
		buttonsContainer.style.height = "100px"; // Set a fixed height for the container

		// Create and append buttons
		for (const label of buttonLabels) {
			const button = document.createElement("button");
			button.textContent = label;
			button.style.border = "2px solid slate";
			if (label !== "") button.style.background = "black";
			else button.style.background = "transparent";
			button.style.fontFamily = "ChiKareGo2";
			button.setAttribute("data-key", label);
			button.style.color = "white";
			button.style.cursor = "pointer";
			button.style.fontSize = "25px";
			button.style.border = "2px #eee inset";
			button.style.padding = "8px"; // Adjust padding for better fit in the grid
			button.style.width = "100%"; // Button occupies the full cell width
			button.style.height = "100%"; // Button occupies the full cell height

			if (label === "") {
				button.id = "glass";
				button.style.border = "0px";
				button.style.top = "140px";
				button.style.left = "70px";
				button.style.height = "200px";

				button.style.padding = "200px";
				button.style.position = "fixed";
				button.style.outline = "none";
				button.style.zIndex = "100";
			}

			if (label === "1") {
				button.textContent = "↶ q";
				button.id = "1";
			}

			if (label === "2") {
				button.textContent = "↷ e";
				button.id = "2";
			}
			console.log("click handler");
			button.onclick = this.handleButtonClick;

			buttonsContainer.appendChild(button);
		}
		const colorIndex = Math.floor(Math.random() * hex_colors.length);
		let index = 0;
		for (let i = 0; i < this.dungeon.map.length; i++) {
			for (let j = 0; j < this.dungeon.map[i].length; j++) {
				if (Math.random() < 0.1 && this.dungeon.map[i][j] === 1) {
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
		document
			.getElementById("glass")
			?.addEventListener("click", this.onMouseClick, false);
		window.addEventListener("click", this.onMouseClick, false);

		document.addEventListener("keydown", this.onKeyDown);

		const lightCoords = [
			[3, 8],
			[2, 2],
			[5, 4],
			[9, 2],
			[24, 4],
			[27, 7],
			[24, 7],
			[27, 4],
		];

		const bulbGeo = new SphereGeometry(0.05, 32, 16);
		const bulbMaterial = new MeshPhongMaterial({
			color: 0xffffcc,
			emissive: 0xffffcc,
		});
		for (let i = 0; i < lightCoords.length; i += 1) {
			const bulb = new Mesh(bulbGeo, bulbMaterial);
			bulb.position.x = lightCoords[i][0];
			bulb.position.z = lightCoords[i][1];
			bulb.position.y = 0.871;
			const bulbLight = new PointLight(0xfff0dd, 0.8, 4);
			// bulbLight.castShadow = true;
			bulbLight.shadow.mapSize.setScalar(512);
			bulbLight.shadow.camera.near = 0.075;
			bulbLight.shadow.camera.far = 0.13;
			bulb.add(bulbLight);
			this.pivot.add(bulb);
		}

		// Append the container to the body
		document.body.appendChild(buttonsContainer);

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

		// dungeon.addMeshesToScene(pivot, party.camera);
		this.dungeon.addMeshesToScene(this.pivot);

		const validPositions = this.findValidPositions(
			Number(localStorage.getItem("x"))
				? Number(localStorage.getItem("x"))
				: STARTING_X,
			Number(localStorage.getItem("y"))
				? Number(localStorage.getItem("y"))
				: STARTING_Y,
			4,
		);

		const ambientLight = new AmbientLight(0x08131c);
		this.pivot.add(ambientLight);

		this.party.light.shadow.mapSize.setScalar(4096);
		// party.light.castShadow = true
	}

	cubes: Mesh[] = [];
	raycaster = new Raycaster();
	mouse = new Vector2();
	coloredCells: ColoredCell[] = [];

	gameContainer = document.getElementById("gameContainer")!;

	playerPosition = { x: STARTING_X, y: STARTING_Y, rotation: 0 };

	calculateBounds() {
		const halfSize = Math.floor(gridSize / 2);
		const startX = Math.max(
			0,
			Math.min(
				this.playerPosition.x - halfSize,
				this.dungeon.map[0].length - gridSize,
			),
		);
		const startY = Math.max(
			0,
			Math.min(
				this.playerPosition.y - halfSize,
				this.dungeon.map.length - gridSize,
			),
		);
		return { startX, startY };
	}

	renderMap() {
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
				if (cell === 1) cellDiv.classList.add("obstacle");

				if (i === this.playerPosition.y && j === this.playerPosition.x) {
					const playerMarker = document.createElement("div");
					playerMarker.className = "player-marker";
					playerMarker.style.transform = `translate(-50%, -50%) rotate(${this.playerPosition.rotation}deg)`;
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
	}

	handleKeyPress = (event) => {
		let newX = this.playerPosition.x;
		let newY = this.playerPosition.y;
		let rotation = this.playerPosition.rotation;
		const adjustedRotation = rotation % 360;
		switch (event.keyCode) {
			case 87: // W (up)
				if (adjustedRotation === 0) {
					newY--;
				} else if (adjustedRotation === 90 || adjustedRotation === -270) {
					newX++;
				} else if (adjustedRotation === 180 || adjustedRotation === -180) {
					newY++;
				} else if (adjustedRotation === 270 || adjustedRotation === -90) {
					newX--;
				}
				break;
			case 83: // S (down)
				if (adjustedRotation === 0) {
					newY++;
				} else if (adjustedRotation === 90 || adjustedRotation === -270) {
					newX--;
				} else if (adjustedRotation === 180 || adjustedRotation === -180) {
					newY--;
				} else if (adjustedRotation === 270 || adjustedRotation === -90) {
					newX++;
				}
				break;
			case 65: // A (left)
				if (adjustedRotation === 0) {
					newX--;
				} else if (adjustedRotation === 90 || adjustedRotation === -270) {
					newY--;
				} else if (adjustedRotation === 180 || adjustedRotation === -180) {
					newX++;
				} else if (adjustedRotation === 270 || adjustedRotation === -90) {
					newY++;
				}
				break;
			case 68: // D (right)
				if (adjustedRotation === 0) {
					newX++;
				} else if (adjustedRotation === 90 || adjustedRotation === -270) {
					newY++;
				} else if (adjustedRotation === 180 || adjustedRotation === -180) {
					newX--;
				} else if (adjustedRotation === 270 || adjustedRotation === -90) {
					newY--;
				}
				break;
			case 69: // E (rotate right)
				rotation = (rotation + 90) % 360;
				break;
			case 81: // Q (rotate left)
				rotation = (rotation - 90) % 360;
				break;
		}
		if (newX >= 0 && newY >= 0 && this.dungeon.map[newY][newX] === 1) {
			this.playerPosition = { x: newX, y: newY, rotation };
		} else {
			this.playerPosition.rotation = rotation;
		}
		this.renderMap();
	};

	handleButtonClick = (event) => {
		const key = event.keyCode ? event.keyCode : event.which;
		const compass = event.target.textContent.toLowerCase();

		let key_code = -1;
		this.handleKeyPress(event);
		switch (compass) {
			case "q":
				key_code = 81;
				break;
			case "w":
				key_code = 87;
				break;
			case "e":
				key_code = 69;
				break;
			case "s":
				key_code = 83;
				break;
			case "a":
				key_code = 65;
				break;
			case "d":
				key_code = 68;
				break;
		}
		if (key_code === -1) {
			return;
		}
		if (this.party) {
			this.party.handleKey(key_code);
		}

		const keyChar = String.fromCharCode(key_code);
		const button = document.querySelector(
			`button[data-key="${keyChar.toUpperCase()}"]`,
		);
		if (button) {
			this.flashButton(button as HTMLButtonElement);
		}
	};

	flashButton(button: HTMLButtonElement) {
		const originalBackground = button.style.background;
		button.style.background = "grey";
		setTimeout(() => {
			button.style.background = originalBackground;
		}, 100); // Set back after 100 ms
	}

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
				if (map[z][x] === 1) {
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

	onKeyDown = (e: KeyboardEvent) => {
		const key = e.keyCode ? e.keyCode : e.which;
		if (this.party) {
			this.party.handleKey(key);
		}
		const keyChar = String.fromCharCode(key);
		const button = document.querySelector(
			`button[data-key="${keyChar.toUpperCase()}"]`,
		);
		if (button) {
			this.flashButton(button as HTMLButtonElement);
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
		document.removeEventListener("keydown", this.handleKeyPress);
		window.removeEventListener("click", this.onMouseClick);
		document.removeEventListener("keydown", this.onKeyDown);
		document.body.removeChild(this.buttonsContainer);
	};
}
