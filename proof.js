if (document.readyState === "complete") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}

function init() {
  let button = document.getElementById("drawButton");
  button.onclick = () => {
    let profileURL =
      "https://storage.googleapis.com/mvpdemo-colors/JapanColor2002Newspaper.icc";
    let imageURL =
      "https://storage.googleapis.com/mvpdemo-colors/sample_pictures/adobeRGB/peppers.jpg";
    let imgBefore = new ICCImage(
      document.getElementById("imageBefore"),
      profileURL,
      imageURL,
      true
    );
    imgBefore.render();
    let imgAfter = new ICCImage(
      document.getElementById("imageAfter"),
      profileURL,
      imageURL,
      false
    );
    imgAfter.render();
  };
}

class ICCImage {
  constructor(canvas, outputProfile, imagePath, showOriginal) {
    this.canvas = canvas;
    this.outputProfile = outputProfile;
    this.imagePath = imagePath;
    this.showOriginal = showOriginal;
    this.ctx = canvas.getContext("2d");
    this.width = parseInt(this.canvas.getAttribute("width"));
    this.height = parseInt(this.canvas.getAttribute("height"));
  }

  render() {
    // Load a profile
    var CMYKprofile = new jsColorEngine.Profile();
    CMYKprofile.load(this.outputProfile, (profile) => {
      console.log("loaded: ", profile);
      var proofTransform = new jsColorEngine.Transform({
        buildLUT: true,
        dataFormat: "int8",
        BPC: [true, false], // Enable blackpoint compensation on preceptional intent but not relative
      });
      proofTransform.createMultiStage([
        "*AdobeRGB",
        jsColorEngine.eIntent.perceptual,
        CMYKprofile,
        jsColorEngine.eIntent.relative,
        "*srgb",
      ]);
      console.log("Proof transform created", proofTransform);
      // Convert an image
      var image = new Image();
      console.log(this.imagePath);
      image.src = this.imagePath;
      image.crossOrigin = "Anonymous";

      let ctx = this.ctx;
      let theCanvas = this.canvas;
      let localShowOriginal = this.showOriginal;
      image.onload = function () {
        console.log("loaded image", ctx);
        theCanvas.width = image.width;
        theCanvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);
        var imageData = ctx.getImageData(0, 0, image.width, image.height);
        console.log("imageData: ", imageData);
        if (localShowOriginal) {
          ctx.putImageData(imageData, 0, 0);
        } else {
          var data = proofTransform.transformArray(
            imageData.data,
            true,
            true,
            true
          );
          console.log("proof data: ", data);
          var newImageData = ctx.createImageData(image.width, image.height);
          newImageData.data.set(data);
          ctx.putImageData(newImageData, 0, 0);
        }
      };
    });
  }
}
