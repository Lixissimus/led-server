let colorPicker = document.querySelector(".jscolor");
let url = "http://192.168.178.91:8888";

function setColor(color, fade) {
  console.log(fade);
  fetch(`${url}/show`, {
    "method": "POST",
    "headers": {
      "content-type": "application/json"      
    },
    "body": JSON.stringify({
      r: color.r,
      g: color.g,
      b: color.b,
      mode: fade ? "fade" : "static",
      dur: 200
    })
  });
}

function startFireProgram() {
  fetch(`${url}/show`, {
    method: "POST",
    body: JSON.stringify({
      mode: "program",
      name: "fire.js"
    })
  });
}

function stopFireProgram() {
  fetch(`${url}/show`, {
    method: "POST",
    body: JSON.stringify({
      mode: "stop"
    })
  });
}

function onColorChanged(_color, fade) {
  let color = hexToRgb(_color.toString());
  setColor(color, fade);
}

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}