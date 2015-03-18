/// <reference path='../Models/PopupWindow.ts'/>

class PopupWindowView {
  private _popupWindowController: PopupWindowController;

  constructor(popupWindowController: PopupWindowController) {
    this._popupWindowController = popupWindowController;
  }

  render(el: HTMLElement) {
    var link: JQuery = $("<a>", { class: "fullscreen", href: "" });

    var icon: JQuery = $("<img/>", { src: "/resources/ic_fullscreen_white_48dp.png" })

    link.append(icon);

    link.click((e) => this._popupWindowController.onClick(e));

    $(el).append(link);
  }
}
