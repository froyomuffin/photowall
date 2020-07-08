// Based off: https://javascript.info/mouse-drag-and-drop


function createBoxElement(width, height, color, startLeft, startTop, id = 0) {
  const newBoxElement = document.createElement('div');

  newBoxElement.className = "box";
  newBoxElement.id = id;
  newBoxElement.style.position = "absolute";
  newBoxElement.style.right = "auto";
  newBoxElement.style.width = width + 'px';
  newBoxElement.style.height = height + 'px';
  newBoxElement.style.backgroundColor = color;
  newBoxElement.style.left = startLeft + 'px';
  newBoxElement.style.cursor = 'grab';
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
          pictureDatum.id,
        );
        container.append(newBoxElement);
        enableDragging(newBoxElement);
      });
    });
}

function syncPicture(boxElement) {
  let id = boxElement.id;
  let url = `http://localhost:3000/pictures/${id}`;

  let data = {
    top: boxElement.style.top,
    left: boxElement.style.left,
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
    .then( data => {
      console.log(data);
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

    function handleMouseDrop(event) {
      document.removeEventListener('mousemove', handleMouseMove);
      syncPicture(boxElement);
      boxElement.style.cursor = 'grab';
    }

    boxElement.style.cursor = 'grabbing';

    document.addEventListener('mousemove', handleMouseMove);

    // Unbind move tracking when the boxElement is dropped
    boxElement.onmouseup = () => {
      handleMouseDrop(event);
      boxElement.onmouseup = null;
    };

    // Unbind move tracking even when the boxElement is dropped off screen
    document.onmouseleave = () => {
      handleMouseDrop(event);
      boxElement.onmouseleave = null;
    };
  };
}

document.addEventListener("DOMContentLoaded", function() {
  boxContainer = document.getElementById("container");

  loadPictures(boxContainer);
  enableDragging(document.getElementById("testcat"));
});
