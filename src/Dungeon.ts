import {
	BoxGeometry,
	Mesh,
	MeshPhongMaterial,
	NearestFilter,
	type Object3D,
	type PerspectiveCamera,
	PlaneGeometry,
	RepeatWrapping,
	TextureLoader,
} from "three";
import { Party } from "./Party";
import { STARTING_X, STARTING_Y, TILES } from "./constants";
import { Direction } from "./directionUtils";
import { loadMapDataFromImage } from "./loadMapDataFromImage";

export class Dungeon {
	spawn_loc = { x: STARTING_X, y: STARTING_Y };

	// spawn_loc = {x: Number(localStorage.getItem('x')), y: Number(localStorage.getItem('y'))};
	spawn_dir = Direction.NORTH;
	map: (0 | 1 | 2)[][];
	constructor(
		private pivot: Object3D,
		private camera: PerspectiveCamera,
	) {
		//
	}

	async loadMap(imagePath: string) {
		this.map = await loadMapDataFromImage(imagePath);
	}

	partyCollidesWith(x: number, y: number) {
		if (y >= 0 && y < this.map.length) {
			const row = this.map[y];
			if (x >= 0 && x < row.length) {
				return TILES[row[x]].isSolid;
			}
		}
		return false;
	}

	spawnParty(x: number, y: number, spawn_dir: Direction) {
		if (x) {
			console.log("spawning");
			return new Party(this.pivot, this.camera, x, y, spawn_dir, (x, y) =>
				this.partyCollidesWith(x, y),
			);
		}
		console.log("default");
		return new Party(
			this.pivot,
			this.camera,
			this.spawn_loc.x,
			this.spawn_loc.y,
			this.spawn_dir,
			(x, y) => this.partyCollidesWith(x, y),
		);
	}

	addMeshesToScene(scene: Object3D) {
		const texLoader = new TextureLoader();
		const map = this.map;

		// texLoader.load('./js/app/portal-3.gif', function (texture) {

		texLoader.load("textures/brick/diffuse.png", (diffuse) => {
			diffuse.magFilter = NearestFilter;
			diffuse.minFilter = NearestFilter;
			diffuse.wrapS = diffuse.wrapT = RepeatWrapping;
			diffuse.repeat.set(1, 1);

			texLoader.load("textures/brick/normal.png", (normal) => {
				normal.magFilter = NearestFilter;
				normal.minFilter = NearestFilter;
				normal.wrapS = normal.wrapT = RepeatWrapping;
				normal.repeat.set(1, 1);

				const material = new MeshPhongMaterial({
					map: diffuse,
					normalMap: normal,
					// shininiess: 1
				});

				const basicWallGeom = new BoxGeometry(1, 1, 1);
				const basicTileGeom = new PlaneGeometry(1, 1, 1);
				for (let y = 0; y < map.length; y++) {
					const row = map[y];
					for (let x = 0; x < row.length; x++) {
						const type = row[x];

						if (type === 0) {
							const mesh = new Mesh(basicWallGeom, material);
							mesh.castShadow = true;
							mesh.receiveShadow = true;

							mesh.position.x = x;
							mesh.position.y = 0.5;
							mesh.position.z = y;
							scene.add(mesh);
						}
						if (type === 1 || type === 2) {
							const floorMesh = new Mesh(basicTileGeom, material);
							floorMesh.castShadow = true;
							floorMesh.receiveShadow = true;

							floorMesh.position.x = x;
							floorMesh.position.y = 0;
							floorMesh.position.z = y;
							floorMesh.rotation.x = Math.PI * -0.5;
							scene.add(floorMesh);

							const ceilMesh = new Mesh(basicTileGeom, material);
							ceilMesh.castShadow = true;
							ceilMesh.receiveShadow = true;

							ceilMesh.position.x = x;
							ceilMesh.position.y = 1;
							ceilMesh.position.z = y;
							ceilMesh.rotation.x = Math.PI * 0.5;
							scene.add(ceilMesh);
						}
					}
				}
			});
		});
	}
}
