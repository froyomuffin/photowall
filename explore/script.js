// Based off: https://javascript.info/mouse-drag-and-drop


document.addEventListener("DOMContentLoaded", function() {
  boxes = document.querySelectorAll(".box");

  boxes.forEach(function(box) {
    // Disable native drag and drop
    box.ondragstart = function() { return false; };

    box.onmousedown = (event) => {
      // Compute where on the box was clicked
      let clickOffsetX = event.clientX - box.getBoundingClientRect().left;
      let clickOffsetY = event.clientY - box.getBoundingClientRect().top;

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
