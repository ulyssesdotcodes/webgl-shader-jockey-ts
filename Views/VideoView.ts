class VideoView{
  private _video: HTMLVideoElement;
  private _videoController: VideoController;

  constructor(videoController: VideoController) {
    this._video = document.createElement("video");
    this._video.setAttribute("class", "camera");
    this._video.setAttribute("autoplay", "true");
    this._video.setAttribute("muted", "true");
    // this._video.setAttribute("src", ".ignored/video.mp4")

    this._videoController = videoController;


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

    this._videoController.setVideoSource(this._video);
  }
}
