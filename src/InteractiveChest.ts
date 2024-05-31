import {
  Color,
  type Intersection,
  Mesh,
  MeshPhongMaterial,
  Object3D,
  type Object3DEventMap,
  type PerspectiveCamera,
  PointLight,
  Raycaster,
  Vector2,
} from "three";
import { getRandom } from "./arrayUtils";
import type { ChestData } from "./cubeColors";
import { getRandomIntInRange } from "./getRandomIntInRange";
import { getProtoMesh } from "./gltfUtils";

const tempIntersections: Intersection<Object3D<Object3DEventMap>>[] = [];
export class InteractiveChest {
  visuals: Object3D;
  rollers: Object3D[] = [];
  intervalID: number | undefined;
  isMouseDown: boolean;
  raycaster: Raycaster;
  mouse: Vector2;
  activeRoller: Object3D<Object3DEventMap> | undefined;
  constructor(
    public chestData: ChestData,
    private camera: PerspectiveCamera,
  ) {
    this.visuals = new Object3D();
    this.raycaster = new Raycaster();
    this.mouse = new Vector2();
    this.init();
  }
  async init() {
    const protoChest = await getProtoMesh("chest", "chest");
    const chest = protoChest.clone();
    const glow = chest.getObjectByName("glow");
    const protoRoller = await getProtoMesh("chest", "roller-prototype");
    if (!protoRoller) {
      throw new Error("could not find roller prototype");
    }
    const pr = protoRoller;
    function getGlow(suffix: string) {
      const r = pr.getObjectByName(`roller-glow-${suffix}`);
      if (!r) {
        throw new Error("could not find roller glow");
      }
      return r;
    }

    chest.traverse((m) => {
      if (m.name.startsWith("roller") && m.name.length === 7) {
        this.rollers.push(m);
      }
    });

    const rollerGlows = [
      getGlow("d2"),
      getGlow("d1"),
      getGlow("0"),
      getGlow("u1"),
      getGlow("u2"),
    ];

    this.rollers.sort((a, b) => a.name.localeCompare(b.name));

    const id = Math.random().toString().slice(2, 4);

    console.log("---");
    let cursor = 0;
    const t = this.rollers.length;
    const notchesAbs: number[] = new Array(t);
    notchesAbs[0] = 0;
    for (let i = 0; i < t - 1; i++) {
      cursor = getRandomIntInRange(
        Math.max(-2, cursor - 2),
        Math.min(2, cursor + 2),
      );
      notchesAbs[i + 1] = cursor;
    }
    notchesAbs[t] = 0;

    const notchesRel: number[] = new Array(t);
    for (let i = 0; i < t; i++) {
      notchesRel[i] = notchesAbs[i + 1] - notchesAbs[i];
    }

    for (let i = 0; i < t; i++) {
      console.log(id, notchesAbs[i + 1], notchesRel[i]);
    }

    let notchCursor = 0;
    for (let i = 0; i < this.rollers.length; i++) {
      const roller = this.rollers[i];
      const notch = notchesRel[i];
      const notchGlow = rollerGlows[notch + 2].clone();
      notchGlow.rotation.x = (notchCursor / 16) * Math.PI * 2;
      console.log("!", notchCursor);
      notchCursor -= notch;
      roller.add(notchGlow);
      // roller.userData.virtualY = 0
      roller.userData.virtualY = (~~(Math.random() * 16) / 16) * Math.PI * 2;
      roller.rotation.x = roller.userData.virtualY;
    }

    if (glow instanceof Mesh) {
      const originalGlowMaterial = glow.material;
      const glowMat = new MeshPhongMaterial({
        color: new Color(this.chestData.colorLoot)
          .multiplyScalar(0.001)
          .addScalar(0.005),
        emissive: this.chestData.colorLoot,
        shininess: 100,
      });
      chest.traverse((m) => {
        if (m instanceof Mesh && m.material === originalGlowMaterial) {
          m.material = glowMat;
        }
      });
    }

    chest.userData.loot_id = this.chestData.id;

    chest.name = "loot"; //portal
    chest.userData.color = this.chestData.color;
    const chestLight = new PointLight(this.chestData.color, 0.6, 3);
    chest.add(chestLight);
    this.visuals.add(chest);
  }

  private updateIntersections(x: number, y: number) {
    this.mouse.x = (x / window.innerWidth) * 2 - 1;
    this.mouse.y = -(y / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    tempIntersections.length = 0;
    this.raycaster.intersectObjects(this.rollers, false, tempIntersections);
  }

  private onMouseDown = (event: MouseEvent) => {
    console.log("md");
    this.isMouseDown = true;

    this.updateIntersections(event.clientX, event.clientY);

    if (tempIntersections.length > 0) {
      this.activeRoller = tempIntersections[0].object;
    }
    this.lastY = event.y;
  };

  private lastY = 0;
  private onMouseMove = (event: MouseEvent) => {
    const deltaY = event.y - this.lastY;
    if (this.activeRoller) {
      this.activeRoller.userData.virtualY += (deltaY / window.innerHeight) * 10;
      this.activeRoller.rotation.x = this.activeRoller.userData.virtualY;
    } else {
      this.updateIntersections(event.clientX, event.clientY);
      document.body.style.cursor =
        tempIntersections.length > 0 ? "ns-resize" : "default";
    }
    this.lastY = event.y;
    console.log("mm");
  };

  private onMouseUp = (event: MouseEvent) => {
    console.log("mu");
    this.updateIntersections(event.clientX, event.clientY);
    this.activeRoller = undefined;
    this.isMouseDown = false;
  };

  tick = () => {
    // for (let i = 0; i < this.rollers.length; i++) {
    //   const roller = this.rollers[i];
    //   roller.rotation.x +=
    //     Math.sin(performance.now() * (0.0002 * ((i * 17 + 3) % 6.3)) - 0.02) *
    //     0.1;
    // }
  };

  activate() {
    this.intervalID = setInterval(this.tick, 1000 / 60);
    document.addEventListener("mousedown", this.onMouseDown);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
    console.log("activate interactive chest");
  }
  deactivate() {
    if (this.intervalID !== undefined) {
      clearInterval(this.intervalID);
      this.intervalID = undefined;
    }
    document.removeEventListener("mousedown", this.onMouseDown);
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
    console.log("deactivate interactive chest");
  }
}
