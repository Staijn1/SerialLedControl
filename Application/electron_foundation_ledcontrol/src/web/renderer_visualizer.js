const {ipcRenderer} = require('electron')

ipcRenderer.send('setMode', 55);

ipcRenderer.on('setErrorElement', function (event, response) {
    const errors = document.getElementById("errors");
    errors.innerHTML = response;
})

ipcRenderer.on('commandReply', function (event, response) {
    console.log("commandReply")
    console.log(response)
})

document.addEventListener("DOMContentLoaded", function (){
    ipcRenderer.send('spotify-oauth', 'getToken')
})
