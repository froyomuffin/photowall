// Based off: https://javascript.info/mouse-drag-and-drop


function createBoxElement(width, height, color, startLeft, startTop) {
  const newBoxElement = document.createElement('div');

  newBoxElement.className = "box";
  newBoxElement.style.position = "absolute";
  newBoxElement.style.right = "auto";
  newBoxElement.style.width = width + 'px';
  newBoxElement.style.height = height + 'px';
  newBoxElement.style.backgroundColor = color;
  newBoxElement.style.left = startLeft + 'px';
  newBoxElement.style.top = startTop + 'px';

  return newBoxElement;
}

function loadBoxes(container) {
  boxData = [
    [50, 50, 'lightblue', 100, 200],
    [50, 50, 'yellow', 150, 200],
    [50, 50, 'red', 200, 200]
  ];

  boxData.forEach((boxDatum) => {
    let newBoxElement = createBoxElement(...boxDatum);
    container.append(newBoxElement);
    enableDragging(newBoxElement);
  });
}

function loadPicturesFromServer(container) {
  fetch("http://localhost:3000/pictures")
    .then(response => response.json())
    .then((pictureData) => {
      pictureData.forEach((pictureDatum) => {
        let newBoxElement = createBoxElement(
          pictureDatum.width,
          pictureDatum.height,
          'orange',
          pictureDatum.left,
          pictureDatum.top,
        );
        container.append(newBoxElement);
        enableDragging(newBoxElement);
      });
    });
}

function loadPictures(container) {
  loadBoxes(container);
  loadPicturesFromServer(container);
}

function enableDragging(boxElement) {
  // Disable native drag and drop
  boxElement.ondragstart = function() { return false; };

  boxElement.onmousedown = (event) => {
    // Compute where on the boxElement was clicked
    const clickOffsetX = event.clientX - boxElement.getBoundingClientRect().left;
    const clickOffsetY = event.clientY - boxElement.getBoundingClientRect().top;

    function moveTo(pageX, pageY) {
      boxElement.style.left = pageX - clickOffsetX + 'px';
      boxElement.style.top = pageY - clickOffsetY + 'px';
    }

    function handleMouseMove(event) {
      moveTo(event.pageX, event.pageY);
    }

    document.addEventListener('mousemove', handleMouseMove);

    // Unbind move tracking when the boxElement is dropped
    boxElement.onmouseup = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      boxElement.onmouseup = null;
    };

    // Unbind move tracking even when the boxElement is dropped off screen
    document.onmouseleave = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      boxElement.onmouseleave = null;
    };
  };
}

document.addEventListener("DOMContentLoaded", function() {
  boxContainer = document.getElementById("container");

  loadPictures(boxContainer);
  enableDragging(document.getElementById("testcat"));
});
