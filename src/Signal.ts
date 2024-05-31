export class Signal<T> {
  listeners: ((value: T) => void)[] = [];
  listen(listener: (value: T) => void) {
    this.listeners.push(listener);
  }

  oneTimeListeners: ((value: T) => void)[] = [];
  listenOnce(listener: (value: T) => void) {
    this.oneTimeListeners.push(listener);
  }

  emit(value: T) {
    for (const listener of this.listeners) {
      listener(value);
    }
    for (const listener of this.oneTimeListeners) {
      listener(value);
    }
    this.oneTimeListeners.length = 0;
  }
}
