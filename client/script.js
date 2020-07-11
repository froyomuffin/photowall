class Canvas {
  constructor() {
    this._element = document.createElement('div');

    this._element.className = "canvas";
    this._element.id = "canvas";

    document.body.append(this._element);
  }

  loadImagesFromServer() {
    fetch("http://localhost:3000/pictures")
      .then(response => response.json())
      .then((imageData) => {
        imageData.forEach((imageDatum) => {
          const image = new Image(
            imageDatum.id,
            imageDatum.source,
            imageDatum.width,
            imageDatum.height,
            imageDatum.left,
            imageDatum.top,
          );

          this._element.append(image.element);
        });
      });
  }

  get element() {
    return this._element;
  }
}

class Image {
  constructor(id, source, width, height, left, top) {
    const resizedDimensions = Image.getResizedDimensions(width, height);

    this.createFrameElement(
      id,
      resizedDimensions.width,
      resizedDimensions.height,
      left,
      top,
    );

    this.createImgElement(
      source,
      resizedDimensions.width,
      resizedDimensions.height,
    );

    this.nestImg();
    this.enableDragging();
    this.fadeInWhenLoaded();
  }

  static getResizedDimensions(imageWidth, imageHeight) {
    const maxSize = 200;
    const ratio = imageWidth / imageHeight;

    if (imageWidth > imageHeight) {
      return {
        width: maxSize,
        height: maxSize / ratio,
      };
    } else { 
      return {
        width: maxSize * ratio,
        height: maxSize,
      };
    }
  }

  createFrameElement(id, width, height, left, top) {
    const frameElement = document.createElement('div');

    this.id = id;

    frameElement.className = "frame";
    frameElement.id = id;
    frameElement.style.width = width + 'px';
    frameElement.style.height = height + 'px';
    frameElement.style.left = left + 'px';
    frameElement.style.cursor = 'grab';
    frameElement.style.top = top + 'px';
    frameElement.style.backgroundColor = '#D0D0D0';

    this._frameElement = frameElement;
  }

  createImgElement(source, width, height) {
    const imgElement = document.createElement('img');

    imgElement.src = 'http:/localhost:3000' + source;
    imgElement.width = width;
    imgElement.height = height;

    this._imgElement = imgElement;
  }

  nestImg() {
    this._frameElement.append(this._imgElement);
  }

  fadeInWhenLoaded() {
    if (this._imgElement.complete) {
      this._frameElement.classList.toggle('fade');
    } else {
      this._imgElement.addEventListener('load', () => {
        this._frameElement.classList.toggle('fade');
      });
    }
  }

  get element() {
    return this._frameElement;
  }

  enableDragging() {
    // Disable native Drag n' Drop
    this._frameElement.ondragstart = () => false;

    this._frameElement.onpointerdown = (event) => {
      this._frameElement.setPointerCapture(event.pointerId);
      this._frameElement.style.cursor = 'grabbing';

      this.clickOffsetX = event.clientX - this._frameElement.getBoundingClientRect().left;
      this.clickOffsetY = event.clientY - this._frameElement.getBoundingClientRect().top;

      this._frameElement.onpointermove = (event) => {
        // Compute where in the frameElement was clicked

        const newLeft = event.pageX - this.clickOffsetX + 'px';
        const newTop = event.pageY - this.clickOffsetY + 'px';

        this._frameElement.style.left = newLeft;
        this._frameElement.style.top = newTop;
      };
      ;
    };

    this._frameElement.onpointerup = (event) => {
      this._frameElement.style.cursor = 'grab';
      this._frameElement.onpointermove = null;

      this.sync();
    };
  }

  sync() {
    let url = `http://localhost:3000/pictures/${this.id}`;

    let data = {
      left: this._frameElement.style.left,
      top: this._frameElement.style.top,
    };

    let content = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }

    fetch(url, content)
      .then(response => response.json())
  }
}

// --------------------------------------------------------------------------------------

clicked = false

function createFrameElement(id, width, height, left, top) {
  const frameElement = document.createElement('div');

  frameElement.className = "frame";
  frameElement.id = id;
  frameElement.style.width = width + 'px';
  frameElement.style.height = height + 'px';
  frameElement.style.left = left + 'px';
  frameElement.style.cursor = 'grab';
  frameElement.style.top = top + 'px';
  frameElement.style.backgroundColor = '#D0D0D0';

  return frameElement;
}

function getResizedDimensions(imageWidth, imageHeight) {
  const maxSize = 200;
  const ratio = imageWidth / imageHeight;

  if (imageWidth > imageHeight) {
    return {
      width: maxSize,
      height: maxSize / ratio,
    };
  } else { 
    return {
      width: maxSize * ratio,
      height: maxSize,
    };
  }
}

function createImageElement(source, width, height) {
  const imageElement = document.createElement('img');

  imageElement.src = 'http:/localhost:3000' + source;
  imageElement.width = width;
  imageElement.height = height;

  return imageElement;
}

function createPictureElement(id, source, width, height, left, top) {
  const resizedDimensions = getResizedDimensions(width, height);

  const imageElement = createImageElement(
    source,
    resizedDimensions.width,
    resizedDimensions.height,
  );

  const frameElement = createFrameElement(
    id,
    resizedDimensions.width,
    resizedDimensions.height,
    left,
    top
  );

  frameElement.append(imageElement);

  function fadeIn() {
    frameElement.classList.toggle('fade');
  }

  if (imageElement.complete) {
    fadeIn();
  } else {
    imageElement.addEventListener('load', fadeIn);
  }

  return frameElement;
}

function loadPicturesFromServer(container) {
  fetch("http://localhost:3000/pictures")
    .then(response => response.json())
    .then((pictureData) => {
      pictureData.forEach((pictureDatum) => {
        let pictureElement = createPictureElement(
          pictureDatum.id,
          pictureDatum.source,
          pictureDatum.width,
          pictureDatum.height,
          pictureDatum.left,
          pictureDatum.top,
        );

        container.append(pictureElement);
        enableDragging(pictureElement);
      });
    });
}

function syncPicture(frameElement) {
  let id = frameElement.id;
  let url = `http://localhost:3000/pictures/${id}`;

  let data = {
    top: frameElement.style.top,
    left: frameElement.style.left,
  };

  let content = {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }

  fetch(url, content)
    .then(response => response.json())
}

function loadPictures(container) {
  loadPicturesFromServer(container);
}

function enableDragging(frameElement) {
  // Disable native drag and drop
  frameElement.ondragstart = function() { return false; };

  frameElement.onpointerdown = (event) => {
    if (event.button == 0 && clicked == false) { // Main click only
      clicked = true;

      // Compute where on the frameElement was clicked
      const clickOffsetX = event.clientX - frameElement.getBoundingClientRect().left;
      const clickOffsetY = event.clientY - frameElement.getBoundingClientRect().top;

      function moveTo(pageX, pageY) {
        frameElement.style.left = pageX - clickOffsetX + 'px';
        frameElement.style.top = pageY - clickOffsetY + 'px';
      }

      function handlePointerMove(event) {
        moveTo(event.pageX, event.pageY);
      }

      function handlePointerDrop(event) {
        document.removeEventListener('pointermove', handlePointerMove);
        syncPicture(frameElement);
        frameElement.style.cursor = 'grab';
        clicked = false;
      }

      frameElement.style.cursor = 'grabbing';

      document.addEventListener('pointermove', handlePointerMove);

      // Unbind move tracking when the frameElement is dropped
      frameElement.onpointerup = () => {
        handlePointerDrop(event);
        frameElement.onpointerup = null;
      };

      // Unbind move tracking even when the frameElement is dropped off screen
      document.onpointerleave = () => {
        handlePointerDrop(event);
        frameElement.onpointerleave = null;
      };

      document.ondblclick = () => {
        handlePointerDrop(event);
        frameElement.ondblclick = null;
      };
    };
  };
}

function oldFlow() {
  frameContainer = document.getElementById("container");

  loadPictures(frameContainer);
}

function newFlow() {
  canvas = new Canvas();
  canvas.loadImagesFromServer();
}

document.addEventListener("DOMContentLoaded", function() {
  // oldFlow();
  newFlow();
});
