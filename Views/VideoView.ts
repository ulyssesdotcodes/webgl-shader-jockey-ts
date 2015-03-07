class VideoView{
  private _video: HTMLMediaElement;

  constructor() {
    this._video = document.createElement("video");
    this._video.setAttribute("class", "camera");
    this._video.setAttribute("autoplay", "true");


    navigator["getUserMedia"] = navigator["getUserMedia"]||
      navigator["webkitGetUserMedia"] ||
      navigator["mozGetUserMedia"];
    window["URL"] = window["URL"]|| window["webkitURL"];
  }

  render(el: HTMLElement): void {
    var gotStream = (stream) => {
    	if (window["URL"])
    	{   this._video.src = window["URL"].createObjectURL(stream);   }
    	else // Opera
    	{   this._video.src = stream;   }

    	this._video.onerror = function(e)
    	{   stream.stop();   };
    }

    navigator["getUserMedia"]({audio: false, video: true}, gotStream, console.log);

    $(el).append(this._video);
  }
}
