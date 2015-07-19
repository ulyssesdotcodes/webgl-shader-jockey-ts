class LSystemRenderer extends ObjectRenderer {
  private _line: THREE.Line;

  constructor(line: THREE.Line) {
    super(line);
    this._line = line;
  }

  update(update: any, resolution: THREE.Vector2) {
    super.update(update, resolution);

    this._line.rotateY(update.dt * 0.5);
    this._line.rotateZ(update.dt * 0.5);
  }
}
