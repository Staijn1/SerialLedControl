// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path');



const COMPORT = "COM3";


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1500,
        height: 1000,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, "src/includes/preload.js")
        },
        frame: false
    })

    // and load the index.html of the app.
    mainWindow.loadFile('src/web/index.html')

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()
    mainWindow.maximize()
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const SerialConnection = require('./src/includes/SerialConnection')

//9600 error free in visualizer mode
//28800+ too fast
const connection = new SerialConnection(19200, COMPORT)

ipcMain.on('sendCommand', function (event, arg) {
    connection.send(arg)
    reply(event, 'commandReply');
});

ipcMain.on('setMode', function (event, arg){
    connection.setMode(arg);
    reply(event, 'commandReply')
});

ipcMain.on('getMode', function (event, arg){
    connection.getMode(arg);
    reply(event, 'getModeReply')
});

ipcMain.on('setColor', function (event, arg){
    connection.setColor(arg);
    reply(event, 'commandReply')
});

ipcMain.on('openPort', function (event, arg) {
    reply(event, 'commandReply')
});

ipcMain.on('speed', function (event, arg){
    connection.adjustSpeed(arg);
    reply(event, 'commandReply')
});

ipcMain.on('brightness', function (event, arg){
    connection.adjustBrightness(arg);
    reply(event, 'commandReply')
});

ipcMain.on('setLeds', function (event, arg){
    connection.setLeds(arg);
});

ipcMain.on('getModes', function (event, arg){
    connection.getModes();
    reply(event, 'getModesReply');
});

ipcMain.on('pause', function (event, arg){
    connection.pause();
    reply(event, 'pauseReply');
});

ipcMain.on('resume', function (event, arg){
    connection.resume();
    reply(event, 'resumeReply');
});

ipcMain.on('stop', function (event, arg){
    connection.stop();
    reply(event, 'stopReply');
});

ipcMain.on('run', function (event, arg){
    connection.run();
    reply(event, 'runReply');
});

ipcMain.on('getModeNames', function (event, arg){
    connection.getModeNames();
    reply(event, 'getModeNamesReply')
});

ipcMain.on('setSegment', function (event, arg){
    connection.setSegment(arg);
    reply(event, 'setSegmentReply')
});

function reply(event, channel) {
    setTimeout(function (){
        const errorMessage = connection.getErrorMessage();

        if (errorMessage === undefined) {
            event.sender.send(channel, connection.getReceivedMessage())
        } else {
            console.log('errorMessage: ')
            console.log(errorMessage)
            event.sender.send("setErrorElement", errorMessage);
        }
    }, 45)
}









var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var $ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');

var sassPaths = [
    'node_modules/foundation-sites/scss',
    'node_modules/motion-ui/src'
];

function sass() {
    return gulp.src('scss/app.scss')
        .pipe($.sass({
            includePaths: sassPaths,
            outputStyle: 'compressed' // if css compressed **file size**
        })
            .on('error', $.sass.logError))
        .pipe($.postcss([
            autoprefixer({browsers: ['last 2 versions', 'ie >= 9']})
        ]))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.stream());
};

function serve() {
    browserSync.init({
        server: "./"
    });

    gulp.watch("scss/*.scss", sass);
    gulp.watch("*.html").on('change', browserSync.reload);
}

gulp.task('sass', sass);
gulp.task('serve', gulp.series('sass', serve));
gulp.task('default', gulp.series('sass', serve));

