class Canvas {
  constructor() {
    this._element = document.createElement('div');

    this._element.className = "canvas";
    this._element.id = "canvas";
    this._element.style.height = '100000pt';
    this._element.style.width = '100000pt';

    const addImageButton = new AddImageButton();
    this._element.append(addImageButton.element);

    document.body.append(this._element);

    window.onload = Canvas.center;
  }

  loadImagesFromServer() {
    fetch("http://localhost:3000/pictures")
      .then(response => response.json())
      .then((imageData) => {
        imageData.forEach((imageDatum, index) => {
          const image = new Image(
            imageDatum.id,
            imageDatum.source,
            imageDatum.width,
            imageDatum.height,
            Canvas.addShift(imageDatum.left),
            Canvas.addShift(imageDatum.top),
            index,
          );

          this._element.append(image.element);
        });
      });
  }

  static addShift(position) {
    return parseInt(position, 10) + 50000;
  }

  static removeShift(position) {
    return parseInt(position, 10) - 50000;
  }

  static center() {
    window.scroll(50000, 50000);
  }

}

class Image {
  constructor(id, source, width, height, left, top, zIndex = 0) {
    const resizedDimensions = Image.getResizedDimensions(width, height);

    this.createFrameElement(
      id,
      resizedDimensions.width,
      resizedDimensions.height,
      left,
      top,
      zIndex,
    );

    this.createImgElement(source);

    this.nestImg();
    this.enableDragging();
    this.fadeInWhenLoaded();
  }

  get element() {
    return this._frameElement;
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

  createFrameElement(id, width, height, left, top, zIndex) {
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
    frameElement.style.zIndex = zIndex;

    this._frameElement = frameElement;
  }

  createImgElement(source) {
    const imgElement = document.createElement('img');

    imgElement.src = 'http:/localhost:3000' + source;
    imgElement.style.width = 'auto';
    imgElement.style.height = 'auto';
    imgElement.style.maxWidth = '100%';
    imgElement.style.maxHeight = '100%';

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

  enableDragging() {
    // Disable native Drag n' Drop
    this._frameElement.ondragstart = () => false;

    this._frameElement.onpointerdown = (event) => {
      this._frameElement.setPointerCapture(event.pointerId);
      this._frameElement.style.cursor = 'grabbing';

      // Compute where in the frameElement was clicked
      this.clickOffsetX = event.clientX - this._frameElement.getBoundingClientRect().left;
      this.clickOffsetY = event.clientY - this._frameElement.getBoundingClientRect().top;

      this._frameElement.onpointermove = (event) => {
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
      left: Canvas.removeShift(this._frameElement.style.left),
      top: Canvas.removeShift(this._frameElement.style.top),
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


class AddImageButton {
  constructor() {
    this.createButtonElement();
    this.createInputElement();
    this.linkClick();
  }

  get element() {
    return this._buttonElement;
  }

  createInputElement() {
    const inputElement = document.createElement('input');

    inputElement.type = 'file';
    inputElement.multiple = 'true';
    inputElement.style.display = 'none';

    inputElement.addEventListener('change', (event) => {
      const files = event.target.files; 

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.readAsText(file,'UTF-8');

        reader.onload = event => {
          const formData = new FormData();
          formData.append('picture[image]', file);

          fetch("http://localhost:3000/pictures", {
            method: 'POST',
            body: formData,
          }).then(response => { response.json(); });
        };
      });
    });

    this._inputElement = inputElement;
  }

  createButtonElement() {
    const buttonElement = document.createElement('button');

    buttonElement.style.outline = 'none';
    buttonElement.style.border = 'none';
    buttonElement.style.backgroundColor = 'white';
    buttonElement.style.borderRadius = '100%';
    buttonElement.style.width = '35pt';
    buttonElement.style.height = '35pt';
    buttonElement.style.cursor = 'pointer';
    buttonElement.style.boxShadow =  '0px 0px 3px #7D7D7D';

    buttonElement.style.fontSize = '30pt';
    buttonElement.style.color = '#7D7D7D';
    buttonElement.textContent = '+';

    buttonElement.style.position = 'fixed';
    buttonElement.style.zIndex = '9001';
    buttonElement.style.bottom = '20pt';
    buttonElement.style.right = '20pt';

    buttonElement.style.transition = '0.3s';

    buttonElement.onpointerover = () => {
      buttonElement.style.backgroundColor = '#F5F5F5';
    };

    buttonElement.onpointerdown = () => {
      buttonElement.style.backgroundColor = '#F0F0F0';
    };

    buttonElement.onpointerout = () => {
      buttonElement.style.backgroundColor = 'white';
    };

    this._buttonElement = buttonElement;
  }

  linkClick() {
    this._buttonElement.append(this._inputElement);
    this._buttonElement.addEventListener('click', () => {
      this._inputElement.click();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  canvas = new Canvas();
  canvas.loadImagesFromServer();
});
