const {ipcRenderer} = require('electron')

const sessionStorage = window.sessionStorage;
let modes = sessionStorage.getItem('modes');
let limit;

window.addEventListener("DOMContentLoaded", () => {
    if (modes === null) {
        modes = [];
        setTimeout(getListOfModes, 2550);
    } else {
        modes = JSON.parse(modes)
        showModes()
    }
    ipcRenderer.send('openPort', undefined)
})

function getListOfModes() {
    let i = 0;
    ipcRenderer.send('getModes', undefined);

    function getMode() {
        if (i < limit) {
            ipcRenderer.send('getMode', i);
            setTimeout(getMode, 50)
        } else {
            showModes();
        }
        i++;
    }

    setTimeout(getMode, 400);


    ipcRenderer.on('getModeReply', function (event, arg) {
        console.log(arg)
        modes.push(arg)
    });

    ipcRenderer.on('getModesReply', function (event, arg) {
        console.log(arg)
        limit = arg.amountOfModes;
    });
}

function showModes() {
    sessionStorage.setItem('modes', JSON.stringify(modes));
    const modesTarget = document.getElementById('mode');

    let htmlToOutput = '';
    modes.forEach(function (mode) {

        htmlToOutput += `
        <div class="cell">
                <input type='radio' id="${mode.modeNumber}" name="radioButton" value="${mode.modeNumber}">
                <label class="button full-width" for="${mode.modeNumber}">${mode.modeName}</label>
        </div>`;
    })

    modesTarget.innerHTML = htmlToOutput;
    const elems = document.querySelectorAll('#mode .columns input');
    [].forEach.call(elems, function (el) {
        el.addEventListener('change', handleMode, false);
    });
}

function handleMode(e) {
    e.preventDefault();
    //Change the mode of the ledstrip
    ipcRenderer.send("setMode", e.target.value)
}

ipcRenderer.on('setErrorElement', function (event, response) {
    const errors = document.getElementById("errors");
    errors.innerHTML = response;
})

ipcRenderer.on('commandReply', function (event, response) {
    //Do something with response
    console.log("commandReply")
    console.log(response)
})

const updateBtn = document.getElementById('updateBtn')
updateBtn.addEventListener('click', function () {
    ipcRenderer.send('sendCommand', document.getElementById('notifyVal').value);
})
