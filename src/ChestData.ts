import { Signal } from "./Signal";

export class ChestData {
  opened = false;
  constructor(
    public x: number,
    public y: number,
    public direction: number,
    public color: string,
    public id: number,
  ) {
    //
  }
  openSignal = new Signal<boolean>();
  open() {
    this.opened = true;
    this.openSignal.emit(this.opened);
  }
}
