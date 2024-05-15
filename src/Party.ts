import { type Object3D, type PerspectiveCamera, PointLight } from "three";
import { Easing, Tween } from "three/examples/jsm/libs/tween.module.js";
import { CAMERA_HEIGHT, FOV, KEYBINDINGS, PARTY } from "./constants";
import {
	type Direction,
	RelativeDir,
	asRadians,
	deltaX,
	deltaY,
	relativeTo,
	rotatedCCW,
	rotatedCW,
} from "./directionUtils";
import { fovConvert, mod } from "./utils";

export class Party {
	direction: Direction;
	position: { x: number; y: number };
	collidesWith: (x: number, y: number) => boolean;
	moving = false;
	nextMove: string | null = null;
	keyActions = {
		move_forward: {
			movement: true,
			action: () => {
				this.moveRelative(RelativeDir.FORWARD);
			},
		},
		move_right: {
			movement: true,
			action: () => {
				this.moveRelative(RelativeDir.RIGHT);
			},
		},
		move_left: {
			movement: true,
			action: () => {
				this.moveRelative(RelativeDir.LEFT);
			},
		},
		move_backward: {
			movement: true,
			action: () => {
				this.moveRelative(RelativeDir.BACKWARD);
			},
		},
		rotate_left: {
			movement: true,
			action: () => {
				this.rotateCCW();
			},
		},
		rotate_right: {
			movement: true,
			action: () => {
				this.rotateCW();
			},
		},

		move_forward_arrows: {
			movement: true,
			action: () => {
				this.moveRelative(RelativeDir.FORWARD);
			},
		},
		move_right_arrows: {
			movement: true,
			action: () => {
				this.moveRelative(RelativeDir.RIGHT);
			},
		},
		move_left_arrows: {
			movement: true,
			action: () => {
				this.moveRelative(RelativeDir.LEFT);
			},
		},
		move_backward_arrows: {
			movement: true,
			action: () => {
				this.moveRelative(RelativeDir.BACKWARD);
			},
		},
		rotate_left_arrows: {
			movement: true,
			action: () => {
				this.rotateCCW();
			},
		},
		rotate_right_arrows: {
			movement: true,
			action: () => {
				this.rotateCW();
			},
		},
	};
	light: PointLight;
	constructor(
		pivot: Object3D,
		private camera: PerspectiveCamera,
		x: number,
		y: number,
		dir: Direction,
		collisions: (x: number, y: number) => boolean,
	) {
		this.position = { x: x, y: y };
		this.direction = dir;
		this.collidesWith = collisions;

		this.camera.position.y = CAMERA_HEIGHT;

		this.light = new PointLight(
			PARTY.LIGHT.COLOR,
			PARTY.LIGHT.INTENSITY,
			PARTY.LIGHT.RADIUS,
		);
		pivot.add(this.light);
		this.light.position.x = PARTY.LIGHT.OFFSET.x;
		this.light.position.z = PARTY.LIGHT.OFFSET.y;
		this.light.position.y = PARTY.LIGHT.OFFSET.z;

		this.light.shadow.bias = 0.01; // Prevents shadow lines at seams in walls. Not sure why. Side-effects?
		this.light.shadow.camera.near = 0.05;

		this.updateFov();
		this.updateLocation();
		this.updateRotation();
	}

	updateLocation() {
		this.camera.position.x = this.position.x;
		this.camera.position.z = this.position.y;
	}

	updateRotation() {
		this.camera.rotation.y = asRadians(this.direction);

		this.camera.updateProjectionMatrix();
	}

	updateFov() {
		const vFov = fovConvert(FOV, 1 / this.camera.aspect);
		this.camera.fov = vFov;
	}

	move(dir) {
		this.moving = true;

		const newX = this.position.x + deltaX(dir);
		const newY = this.position.y + deltaY(dir);

		if (this.collidesWith(newX, newY)) {
			const bumpPath = {
				x: [this.position.x + deltaX(dir) * 0.05, this.position.x],
				z: [this.position.y + deltaY(dir) * 0.05, this.position.y],
			};
			//todo
			console.log(bumpPath.x[1]);
			console.log(bumpPath.z[1]);
			localStorage.setItem("x", bumpPath.x[1].toString());
			localStorage.setItem("y", bumpPath.x[1].toString());
			localStorage.setItem("direction-1", this.direction.toString());

			new Tween(this.camera.position)
				.to(bumpPath, PARTY.BUMP_TIME)
				.easing(Easing.Sinusoidal.InOut)
				.onComplete(() => {
					this.moving = false;
				})
				.start();
		} else {
			this.position.x = newX;
			this.position.y = newY;

			//todo
			console.log(this.position.x);
			console.log(this.position.y);

			localStorage.setItem("direction-1", this.direction.toString());

			localStorage.setItem("x", this.position.x.toString());
			localStorage.setItem("y", this.position.y.toString());

			new Tween(this.camera.position)
				.to({ x: newX, z: newY }, PARTY.MOVE_TIME)
				.easing(Easing.Sinusoidal.InOut)
				.onComplete(() => {
					this.moving = false;
					this.updateLocation();
				})
				.start();
		}
	}

	moveRelative(relDir) {
		const moveDir = relativeTo(this.direction, relDir);
		this.move(moveDir);
	}

	setLocation(x, y) {
		this.position.x = x;
		this.position.y = y;
		this.updateLocation();
	}

	rotateTo(dir) {
		this.moving = true;

		this.direction = dir;
		localStorage.setItem("direction-1", this.direction.toString());

		let rotateAmount =
			asRadians(dir) - mod(this.camera.rotation.y, 2 * Math.PI);
		rotateAmount = mod(rotateAmount + Math.PI, 2 * Math.PI) - Math.PI;

		new Tween(this.camera.rotation)
			.to({ y: this.camera.rotation.y + rotateAmount }, PARTY.ROTATE_TIME)
			.easing(Easing.Sinusoidal.InOut)
			.onUpdate(() => {
				this.camera.updateProjectionMatrix();
			})
			.onComplete(() => {
				this.moving = false;
				this.updateRotation();
			})
			.start();
	}

	rotateCW() {
		console.log(rotatedCW(this.direction));
		this.rotateTo(rotatedCW(this.direction));
	}

	rotateCCW() {
		console.log(rotatedCCW(this.direction));
		this.rotateTo(rotatedCCW(this.direction));
	}

	handleKey(key) {
		for (const action in this.keyActions) {
			if (KEYBINDINGS[action].indexOf(key) >= 0) {
				const actionObject = this.keyActions[action];

				if (actionObject.movement && this.moving) {
					this.nextMove = action;
				} else {
					actionObject.action();
				}
			}
		}
	}

	tick() {
		if (!this.moving && this.nextMove != null) {
			this.keyActions[this.nextMove].action();
			this.nextMove = null;
		}
		this.light.position.copy(this.camera.position);
	}
}
