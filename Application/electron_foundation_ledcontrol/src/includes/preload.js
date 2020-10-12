const { ipcRenderer } = require("electron");

const {
    getCurrentWindow,
    openMenu,
    minimizeWindow,
    unmaximizeWindow,
    maxUnmaxWindow,
    isWindowMaximized,
    closeWindow,
} = require("./menu-functions");

window.addEventListener("DOMContentLoaded", () => {
    window.getCurrentWindow = getCurrentWindow;
    window.openMenu = openMenu;
    window.minimizeWindow = minimizeWindow;
    window.unmaximizeWindow = unmaximizeWindow;
    window.maxUnmaxWindow = maxUnmaxWindow;
    window.isWindowMaximized = isWindowMaximized;
    window.closeWindow = closeWindow;

    createMenu();
    createNavigationBar();
    createHero();
    setupControls();
});

function createMenu(){
    const menu = document.getElementById('menu-bar')
    menu.innerHTML = `<div class="right">
        <button class="menubar-btn" id="minimize-btn"><i class="fas fa-window-minimize"></i></button>
        <button class="menubar-btn" id="max-unmax-btn"><i class="far fa-square"></i></button>
        <button class="menubar-btn" id="close-btn"><i class="fas fa-times"></i></button>
    </div>`;
}

function createNavigationBar(){
    const navigationBar = document.getElementById('navigation')

    navigationBar.innerHTML = `<div class="top-bar-left">
        <ul class="menu menu-hover-lines no-text-transform">
            <li class="menu-text h1" id="logo"><a href="index.html" class="text-primary text-primary-hover">Ledcontrol</a></li>
        </ul>
    </div>
    <div class="top-bar-right">
        <ul class="menu menu-hover-lines">
            <li><a href="visualizer.html" class="text-primary text-primary-hover">Visualizer</a></li>
            <li><a href="segments.html" class="text-primary text-primary-hover">Segments</a></li>
        </ul>
    </div>`;
}

function createHero(){
    const hero = document.getElementById('hero')

    hero.innerHTML = `<div class="hero-body">
        <h1 class="text-white accent-font stat" data-animate="slide-in-down slide-out-up">Ledcontrol</h1>
        <div class="grid-x align-center margin-top-2" id="controls">
            <div class="cell small-2">
                <button class="text-white"><i class="fas fa-running fa-lg speed" id="-"></i></button>
            </div>
            <div class="cell small-2">
                <button class="text-white"><i class="fas fa-walking fa-lg speed" id="+"></i></button>
            </div>
            <div class="cell small-2">
                <button class="text-white"><i class="fas fa-plus fa-lg brightness" id="+"></i></button>
            </div>
            <div class="cell small-2">
                <button class="text-white"><i class="fas fa-minus fa-lg brightness" id="-"></i></button>
            </div>
        </div>
        <div id="picker" class="margin-top-3"></div>
    </div>`;
}

function handle_B_S(e) {
    e.preventDefault();
    const element = e.target;
    const classes = element.className;
    if (classes.indexOf('brightness') !== -1){
        ipcRenderer.send('brightness', element.id)
    } else if (classes.indexOf('speed') !== -1) {
        ipcRenderer.send('speed', element.id)
    }
}

function setupControls() {
    const elems = document.querySelectorAll('#controls div button'); // adds listener also to existing s and b buttons
    [].forEach.call(elems, function (el) {
        el.addEventListener('touchstart', handle_B_S, false);
        el.addEventListener('click', handle_B_S, false);
    });
}
