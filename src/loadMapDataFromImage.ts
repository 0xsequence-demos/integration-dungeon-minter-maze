export function loadMapDataFromImage(imagePath: string) {
	return new Promise<(0 | 1 | 2)[][]>((resolve) => {
		const mini_map: (0 | 1 | 2)[][] = [];
		// 2b) Load an image from which to get data
		const img = new Image();
		img.onload = () => {
			const canvas = document.createElement("canvas");
			const w = img.width;
			const h = img.height;
			canvas.width = w;
			canvas.height = h;
			const ctx = canvas.getContext("2d")!;
			ctx.drawImage(img, 0, 0);
			const data = ctx.getImageData(0, 0, w, h);
			const arr = data.data;
			for (let iy = 0; iy < h; iy++) {
				const row: (0 | 1 | 2)[] = [];
				for (let ix = 0; ix < w; ix++) {
					const r = arr[(iy * w + ix) * 4];
					if (r === 255) {
						const g = arr[(iy * w + ix) * 4 + 1];
						if (g === 255) {
							row[ix] = 1;
						} else {
							row[ix] = 2;
						}
					} else {
						row[ix] = 0;
					}
				}
				mini_map.push(row);
			}
			resolve(mini_map);
		};
		img.src = imagePath; // set this *after* onload
	});
}
