export const FOV = 110;

export const CAMERA_HEIGHT = 0.3;

export const PARTY = {
	MOVE_TIME: 300,
	BUMP_TIME: 200,
	ROTATE_TIME: 200,

	LIGHT: {
		COLOR: 0xffee99,
		INTENSITY: 0.8,
		RADIUS: 4.5,
		OFFSET: { x: 0.2, y: 0.2, z: 0.1 },
	},
};

export const KEYBINDINGS = {
	move_forward: [87], // W
	move_left: [65], // A
	move_backward: [83], // S
	move_right: [68], // D

	rotate_left: [81], // Q
	rotate_right: [69], // E

	move_forward_arrows: [38], // up
	move_left_arrows: [37], // left
	move_backward_arrows: [40], // down
	move_right_arrows: [39], //

	rotate_left_arrows: [33], // Q
	rotate_right_arrows: [34], // E
};

export const TILES = [
	{
		isSolid: true,
	},
	{
		isSolid: false,
	},
	{
		isSolid: true,
	},
];
