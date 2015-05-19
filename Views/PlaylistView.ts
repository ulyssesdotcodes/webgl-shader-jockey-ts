class PlaylistView implements IControllerView {
  private _content: JQuery;
  private _playerController: PlayerController;

  private _list: JQuery;
  private _currentTrack: number;

  constructor(playerController: PlayerController) {
    this._content = $("<div>", { class: "controls playlist" });
    this._playerController = playerController;
    this._currentTrack = -1;
  }

  render(el: HTMLElement): void {
    this._list = $("<ol>");

    this._playerController.tracks().forEach(track => {
    });

    this._playerController.tracks().forEach((track) => {
      var trackLi = $("<li>", { html:  this.createText(track)});

      trackLi.click((e) => {
        this._playerController.playTrack(trackLi.index());
      });

      this._list.append(trackLi);
    });

    this._playerController.getTrackObservable()
      .doOnNext(__ => {
        if (this._currentTrack != -1) {
          $(this._list.children().get(this._currentTrack)).css("font-weight", "Normal");
        }
      })
      .subscribe((track) => {
        $(this._list.children().get(track)).css("font-weight", "Bold");
        this._currentTrack = track;
      });

    this._content.append(this._list);
    $(el).append(this._content);
  }

  private createText(track: Track) {
    return track.title + " - " + track.artist;
  }
}
