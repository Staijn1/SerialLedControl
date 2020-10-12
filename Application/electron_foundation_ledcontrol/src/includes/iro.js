const iro = require('@jaames/iro');

let colorPicker;
window.addEventListener("DOMContentLoaded", function () {
    colorPicker = new iro.ColorPicker('#picker', {
        width: 200,
        layoutDirection: "horizontal",
        handleRadius: 6,
        borderWidth: 2,
        borderColor: "#fff",
        wheelAngle: 90,
        colors: [
            'rgb(100%, 0, 0)', // pure red
            'rgb(0, 100%, 0)', // pure green
            'rgb(0, 0, 100%)', // pure blue
        ],
    });

    colorPicker.on('color:change', changeColor)
})


function changeColor(color) {
    const formattedColor = colorPicker.color.hexString.substr(1);
    if (color.index === 0) {
        ipcRenderer.send('setFirstColor', formattedColor);
    }
}
