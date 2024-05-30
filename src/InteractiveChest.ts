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
import type { ChestData } from "./cubeColors";
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
        if (m.name.startsWith("roller") && m.name.length === 7) {
          m.userData.virtualY = Math.random() * Math.PI * 2;
          m.rotation.x = m.userData.virtualY;
          this.rollers.push(m);
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
