// Based off: https://javascript.info/mouse-drag-and-drop


document.addEventListener("DOMContentLoaded", function() {
  boxes = document.querySelectorAll(".box");

  boxes.forEach(function(box) {
    box.onmousedown = function(event) {
      let shiftX = event.clientX - box.getBoundingClientRect().left;
      let shiftY = event.clientY - box.getBoundingClientRect().top;

      box.style.position = 'absolute';
      box.style.zIndex = 1000;
      document.body.append(box);

      moveAt(event.pageX, event.pageY);

      // moves the box at (pageX, pageY) coordinates
      // taking initial shifts into account
      function moveAt(pageX, pageY) {
        box.style.left = pageX - shiftX + 'px';
        box.style.top = pageY - shiftY + 'px';
      }

      function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
      }

      // move the box on mousemove
      document.addEventListener('mousemove', onMouseMove);

      // drop the box, remove unneeded handlers
      box.onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        box.onmouseup = null;
      };

      // allow dragging out of frame
      document.onmouseleave = function() {
        document.removeEventListener('mousemove', onMouseMove);
      };
    };

    box.ondragstart = function() {
      return false;
    };
  });
});
