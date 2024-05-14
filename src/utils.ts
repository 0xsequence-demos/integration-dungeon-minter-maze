// A modulo function that correctly handles negative numbers
export function mod(n, m) {
    return ((n % m) + m) % m
}

export function fovConvert(fov, ratio) {
    return Math.atan(Math.tan(fov * Math.PI/360) * ratio) * 360 / Math.PI;
}
