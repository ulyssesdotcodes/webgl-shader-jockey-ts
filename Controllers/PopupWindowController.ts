class PopupWindowController {
  static LINK = "viewer.html";
  private _popupWindow: PopupWindow;
  constructor() {
    this._popupWindow = new PopupWindow();
  }

  onClick(e: JQueryEventObject) {
    e.preventDefault();
    this._popupWindow.openPopup();
  }
}
