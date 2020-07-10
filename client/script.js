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

document.addEventListener("DOMContentLoaded", function() {
  frameContainer = document.getElementById("container");

  loadPictures(frameContainer);
});
