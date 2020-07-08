// Based off: https://javascript.info/mouse-drag-and-drop


function createBoxElement(width, height, color, startLeft, startTop) {
  const newBoxElement = document.createElement('div');

  newBoxElement.className = "box";
  newBoxElement.style.position = "absolute";
  newBoxElement.style.right = "auto";
  newBoxElement.style.width = width;
  newBoxElement.style.height = height;
  newBoxElement.style.backgroundColor = color;
  newBoxElement.style.left = startLeft;
  newBoxElement.style.top = startTop;

  return newBoxElement;
}

document.addEventListener("DOMContentLoaded", function() {
  boxContainer = document.getElementById("container");

  boxData = [
    ['50px', '50px', 'lightblue', '100px', '100px'],
    ['50px', '50px', 'yellow', '150px', '100px'],
    ['50px', '50px', 'red', '200px', '100px']
  ];

  boxData.forEach((boxDatum) => {
    newBoxElement = createBoxElement(...boxDatum);
    boxContainer.append(newBoxElement);
  });

  boxes = document.querySelectorAll(".box");

  boxes.forEach(function(box) {
    // Disable native drag and drop
    box.ondragstart = function() { return false; };

    box.onmousedown = (event) => {
      // Compute where on the box was clicked
      const clickOffsetX = event.clientX - box.getBoundingClientRect().left;
      const clickOffsetY = event.clientY - box.getBoundingClientRect().top;

      function moveTo(pageX, pageY) {
        box.style.left = pageX - clickOffsetX + 'px';
        box.style.top = pageY - clickOffsetY + 'px';
      }

      function handleMouseMove(event) {
        moveTo(event.pageX, event.pageY);
      }

      document.addEventListener('mousemove', handleMouseMove);

      // Unbind move tracking when the box is dropped
      box.onmouseup = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        box.onmouseup = null;
      };

      // Unbind move tracking even when the box is dropped off screen
      document.onmouseleave = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        box.onmouseleave = null;
      };
    };
  });
});
