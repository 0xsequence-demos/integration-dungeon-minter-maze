import { mod } from "./utils";
export enum RelativeDir {
	FORWARD = 0,
	RIGHT = 1,
	BACKWARD = 2,
	LEFT = 3,
}

export enum Direction {
	NORTH = 0,
	EAST = 1,
	SOUTH = 2,
	WEST = 3,
}

export function relativeTo(dir, relDir) {
	return mod(dir + relDir, 4);
}

export function rotatedCW(dir) {
	return mod(dir + 1, 4);
}

export function rotatedCCW(dir) {
	return mod(dir - 1, 4);
}

export function deltaX(dir) {
	switch (dir) {
		case 0:
		case 2:
			return 0;
		case 1:
			return 1;
		case 3:
			return -1;
		default:
			throw "Invalid Direction";
	}
}

export function deltaY(dir) {
	switch (dir) {
		case 0:
			return -1;
		case 1:
		case 3:
			return 0;
		case 2:
			return 1;
		default:
			throw "Invalid Direction";
	}
}

export function asRadians(dir) {
	return ((4 - dir) % 4) * 0.25 * 2 * Math.PI;
}
