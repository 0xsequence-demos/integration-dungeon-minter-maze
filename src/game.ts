import { NearestFilter, TextureLoader } from "three";
import { ObjectLoader } from "three";
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
import { Tween, update } from "three/examples/jsm/libs/tween.module.js";
import { Dungeon } from "./Dungeon";
import type { Party } from "./Party";

type ColoredCell = {
	x: number;
	y: number;
	color: number;
	color_loot: number;
	id: number;
};

export function game(pivot: Object3D, camera: PerspectiveCamera) {
	const cubes: Mesh[] = [];

	function handleKeyPress(event) {
		let newX = playerPosition.x;
		let newY = playerPosition.y;
		let rotation = playerPosition.rotation;
		console.log(event);
		const adjustedRotation = rotation % 360;
		switch (event.keyCode) {
			case 87: // W (up)
				if (adjustedRotation === 0) {
					console.log("up");
					console.log(newY);
					newY--;
					console.log(newY);
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
					console.log("left");
					console.log(newX);
					newX--;
					console.log(newX);
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
					console.log("right");
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
		if (newX >= 0 && newY >= 0 && mini_map[newY][newX] === 1) {
			playerPosition = { x: newX, y: newY, rotation };
			// renderMap();
		} else {
			playerPosition.rotation = rotation;
			// renderMap();
		}
	}

	document.addEventListener("keydown", handleKeyPress);

	function handleButtonClick(event) {
		console.log(event);
		const key = event.keyCode ? event.keyCode : event.which;
		const compass = event.target.textContent.toLowerCase();

		let key_code = -1;
		handleKeyPress(event);
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
		party.handleKey(key_code);

		const keyChar = String.fromCharCode(key_code);
		const button = document.querySelector(
			`button[data-key="${keyChar.toUpperCase()}"]`,
		);
		if (button) {
			flashButton(button);
		}
	}

	// Array of button labels
	const buttonLabels = ["Q", "W", "E", "A", "S", "D", ""];

	// Create a container for the buttons
	const buttonsContainer = document.createElement("div");
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
		button.onclick = handleButtonClick;

		buttonsContainer.appendChild(button);
	}

	const hex_colors = [
		"#ffb23e", //orange
		"#DCD31D", //yellow
		"#6fcadc", // blue
		"#FF69B4",
		"#008000",
		"#A020F0",
		// 0xD8CBF,
		// 0xD4FF00,
	];

	const mini_map = [
		[
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1,
			1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0,
			0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0,
			1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0,
			1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1,
			1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1,
			1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0,
			1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0,
			1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
			0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1,
			1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
	];

	function flashButton(button) {
		const originalBackground = button.style.background;
		button.style.background = "grey";
		setTimeout(() => {
			button.style.background = originalBackground;
		}, 100); // Set back after 100 ms
	}

	// Append the container to the body
	document.body.appendChild(buttonsContainer);

	const dungeon = new Dungeon(camera);

	let party: Party;

	const direction = {
		FORWARD: 0,
		RIGHT: 1,
		BACKWARD: 2,
		LEFT: 3,
	};

	const url = new URL(window.location.href);
	const params = new URLSearchParams(url.search);

	const refresh = params.get("refresh");

	if (refresh === "true") {
		party = dungeon.spawnParty(
			Number(localStorage.getItem("x")),
			Number(localStorage.getItem("y")),
			Number(localStorage.getItem("direction-1")),
		);
	} else {
		party = dungeon.spawnParty(10, 6, direction.FORWARD);
	}

	// dungeon.addMeshesToScene(pivot, party.camera);
	dungeon.addMeshesToScene(pivot);

	const geometry = new BoxGeometry(0.3, 0.3, 0.3);

	const colors = [
		0xffb23e, //orange
		0xdcd31d, //yellow
		0x6fcadc, // blue
		0xff69b4,
		0x008000,
		0xa020f0,
		// 0xD8CBF,
		// 0xD4FF00,
	];

	const map = [
		[
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1,
			1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0,
			0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0,
			1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 0,
			1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1,
			1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1,
			1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0,
			1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0,
			1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0,
			0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1,
			1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
		[
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		],
	];
	function findValidPositions(map, startX, startY, radius) {
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

	const validPositions = findValidPositions(
		mini_map,
		Number(localStorage.getItem("x")) ? Number(localStorage.getItem("x")) : 10,
		Number(localStorage.getItem("y")) ? Number(localStorage.getItem("y")) : 6,
		4,
	);

	const ambientLight = new AmbientLight(0x08131c);
	pivot.add(ambientLight);

	party.light.castShadow = true;
	party.light.shadowMapWidth = 4096;
	party.light.shadowMapHeight = 4096;

	pivot.add(party.camera);

	const raycaster = new Raycaster();
	const mouse = new Vector2();
	let coloredCells: ColoredCell[] = [];

	function onMouseClick(event) {
		// Calculate mouse position in normalized device coordinates
		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		// Update the picking ray with the camera and mouse position
		raycaster.setFromCamera(mouse, party.camera);

		// Calculate objects intersecting the picking ray
		const intersects = raycaster.intersectObjects(pivot.children);

		for (let i = 0; i < intersects.length; i++) {
			if (
				intersects[i].object.name.slice(0, 4) === "loot" &&
				intersects[i].distance < 1
			) {
				window.parent.postMessage(
					{ portal: "loot", color: intersects[i].object.userData.color },
					"https://dungeon-minter.vercel.app/",
				);

				coloredCells = coloredCells.filter((cell) => {
					if (
						String(cell.id) !== String(intersects[i].object.userData.loot_id)
					) {
						return true;
					}
					return false;
				});
				pivot.remove(intersects[i].object);
				// renderMap()
			}
		}
	}

	const gameContainer = document.getElementById("gameContainer");
	let playerPosition = { x: 13, y: 9, rotation: 0 };
	const gridSize = 9; // This sets the grid size to 9x9
	const colorIndex = Math.floor(Math.random() * hex_colors.length);
	let index = 0;
	for (let i = 0; i < mini_map.length; i++) {
		for (let j = 0; j < mini_map[i].length; j++) {
			if (Math.random() < 0.1 && mini_map[i][j] === 1) {
				// 10% chance to assign a color
				const colorIndex = Math.floor(Math.random() * hex_colors.length);
				coloredCells.push({
					x: i,
					y: j,
					color: hex_colors[colorIndex],
					color_loot: colors[colorIndex],
					id: index,
				});
				index++;
				if (coloredCells.length === 10) break;
			}
		}
		if (coloredCells.length === 10) break;
	}

	console.log(coloredCells);

	for (let i = 0; i < coloredCells.length; i++) {
		const material = new MeshPhongMaterial({
			color: coloredCells[i].color_loot,
			emissive: coloredCells[i].color_loot,
			shininess: 200,
		});

		const cube = new Mesh(geometry, material);
		cube.castShadow = true;

		// Select a random valid position
		if (coloredCells.length > 0) {
			// let randomIndex = Math.floor(Math.random() * validPositions.length);
			// let position = validPositions[randomIndex];

			// validPositions.splice(randomIndex, 1);
			const position = coloredCells[i];
			if (i === 0) {
				console.log();
				// alert('cube x '+position.x)
				// alert('cube y '+position.y)
			}
			cube.userData.loot_id = i;
			cube.position.x = position.y - 3; //13 // // Adjust according to your coordinate system
			cube.position.z = position.x - 3; // Adjust according to your coordinate system
		}

		cube.position.y = 0.31;
		cube.userData.id = i;
		cube.name = "loot"; //portal
		cube.userData.color = coloredCells[i].color;

		const cubeLight = new PointLight(0x66aac0, 0.6, 3);
		cube.add(cubeLight);
		pivot.add(cube);
		cubes.push(cube);
	}

	function calculateBounds() {
		const halfSize = Math.floor(gridSize / 2);
		const startX = Math.max(
			0,
			Math.min(playerPosition.x - halfSize, mini_map[0].length - gridSize),
		);
		const startY = Math.max(
			0,
			Math.min(playerPosition.y - halfSize, mini_map.length - gridSize),
		);
		return { startX, startY };
	}

	// function renderMap() {
	//     if(document.getElementById('mini-map')) {
	//         document.getElementById('mini-map')!.remove()
	//     }
	//     const { startX, startY } = calculateBounds();
	//     const miniMap = document.createElement('div');
	//     miniMap.id = 'mini-map';
	//     miniMap.className = 'mini-map';
	//     for (let i = startY; i < startY + gridSize; i++) {
	//         const rowDiv = document.createElement('div');
	//         rowDiv.className = 'row';
	//         for (let j = startX; j < startX + gridSize; j++) {
	//             const cell = mini_map[i][j];
	//             const cellDiv = document.createElement('div');
	//             cellDiv.className = 'cell';
	//             if (cell === 1) cellDiv.classList.add('obstacle');

	//             if (i === playerPosition.y && j === playerPosition.x) {
	//                 const playerMarker = document.createElement('div');
	//                 playerMarker.className = 'player-marker';
	//                 playerMarker.style.transform = `translate(-50%, -50%) rotate(${playerPosition.rotation}deg)`;
	//                 cellDiv.appendChild(playerMarker);
	//             }
	//             console.log('count:' + coloredCells.length)
	//             const coloredCell = coloredCells.find(loot => loot.x === i && loot.y === j);
	//             if (coloredCell) {
	//                 const colorDiv = document.createElement('div');
	//                 colorDiv.className = 'color-marker';
	//                 colorDiv.style.backgroundColor = coloredCell.color;
	//                 cellDiv.appendChild(colorDiv);
	//             }
	//             rowDiv.appendChild(cellDiv);
	//         }
	//         miniMap.appendChild(rowDiv);
	//     }

	//     gameContainer.innerHTML = '';
	//     gameContainer.appendChild(miniMap);
	// }
	// renderMap();

	// Add event listener for mouse click
	document
		.getElementById("glass")
		?.addEventListener("click", onMouseClick, false);
	window.addEventListener("click", onMouseClick, false);

	document.addEventListener("keydown", (e) => {
		const key = e.keyCode ? e.keyCode : e.which;
		party.handleKey(key);
		const keyChar = String.fromCharCode(key);
		const button = document.querySelector(
			`button[data-key="${keyChar.toUpperCase()}"]`,
		);
		if (button) {
			flashButton(button);
		}
	});

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

	const modelLoader = new ObjectLoader();
	const textureLoader = new TextureLoader();

	modelLoader.load("models/bare_bulb.json", (obj) => {
		textureLoader.load("textures/bare_bulb_color.png", (color) => {
			color.magFilter = NearestFilter;
			textureLoader.load("textures/bare_bulb_emissive.png", (emissive) => {
				const material = new MeshPhongMaterial({
					map: color,
					emissive: 0xffffff,
					emissiveMap: emissive,
				});

				for (let i = 0; i < lightCoords.length; i += 1) {
					const bulb = new Mesh(obj, material);
					bulb.position.x = lightCoords[i][0];
					bulb.position.z = lightCoords[i][1];
					// bulb.castShadow = true;
					const bulbLight = new PointLight(0xfff0dd, 0.8, 4);
					bulbLight.position.y = 0.871;
					//bulbLight.castShadow = true;
					bulbLight.shadow.mapSize.setScalar(512);
					bulbLight.shadow.camera.near = 0.075;
					bulbLight.shadow.camera.far = 0.13;
					bulb.add(bulbLight);
					pivot.add(bulb);
				}
			});
		});
	});

	let time = 0;
	return function simulate(dt: number) {
		time += dt;
		update();

		cubes.map((cube) => {
			cube.rotation.x += 0.02;
			cube.rotation.y += 0.0187;
			// cubeLight.intensity = 0.1 * Math.sin(time * 0.002) + 0.6;
			cube.position.y = 0.1 * Math.sin(time * 0.001) + 0.41;
		});
		party.tick();
	};
}