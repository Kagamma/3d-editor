class BaseComponent {
  constructor() {
    this.name = '';
    this.owner = null;
    this.removeSelf = false;
    this.removeOwner = false;
    this.start.bind(this);
    this.stop.bind(this);
    this.update.bind(this);
  }

  // eslint-disable-next-line class-methods-use-this
  update() {
    // Virtual method
  }

  // eslint-disable-next-line class-methods-use-this
  start() {
    // Virtual method
  }

  // eslint-disable-next-line class-methods-use-this
  stop() {
    // Virtual method
  }
}

export default BaseComponent;
