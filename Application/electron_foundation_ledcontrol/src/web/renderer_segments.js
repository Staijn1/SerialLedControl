const {ipcRenderer} = require('electron')

ipcRenderer.on('setErrorElement', function (event, response) {
    const errors = document.getElementById("errors");
    errors.innerHTML = response;
    console.error(response)
})

ipcRenderer.on('commandReply', function (event, response) {
    console.log("commandReply")
    console.log(response)
})

document.addEventListener("DOMContentLoaded", function () {
    // ipcRenderer.send('spotify-oauth', 'getToken')
})


// global variables
var pin = "?";
var numPixels = 30;
var brightness = 255;
var segmentIndex = 0;
var segments = [
    {start: 0, stop: 9, mode: 0, speed: 1000, options: 0, colors: ['#ff0000', '#00ff00', '#0000ff']}
];

const sessionStorage = window.sessionStorage;
let modes = sessionStorage.getItem('modes');
let limit;


// onready function
$(document).ready(function () {
    console.log("ready!");
    initSliders();
    if (modes === null) {
        modes = [];
        setTimeout(getModes, 2550);
    } else{
        modes = JSON.parse(modes)
        showModes()
    }
});

function initSliders() { // init all the noUiSliders
    noUiSlider.create(document.getElementById('rangeSlider'), {
        start: [0, 99],
        tooltips: [true, true],
        connect: [false, true, false],
        range: {
            'min': 0,
            'max': numPixels - 1
        },
        format: {
            to: function (value) {
                return value.toFixed(0);
            },
            from: function (value) {
                return parseInt(value, 10);
            }
        }
    });
    document.getElementById('rangeSlider').noUiSlider.on('end', function () {
        updateSegment();
    });

    noUiSlider.create(document.getElementById('speedSlider'), {
        start: 1000,
        tooltips: true,
        connect: [true, false],
        step: 10,
        range: {
            'min': [20, 1],
            '25%': [100, 10],
            '50%': [1000, 100],
            '75%': [10000, 500],
            'max': [30000]
        },
        format: {
            to: function (value) {
                return value.toFixed(0);
            },
            from: function (value) {
                return parseInt(value, 10);
            }
        }
    });
    document.getElementById('speedSlider').noUiSlider.on('end', function () {
        updateSegment();
    });
}


function showModes() {
    console.log("showModes")
    console.log(modes)
    $("#modes").empty();

    const convertedModes = modes.map(function (item, i) {
        console.log("Item: ")
        console.log(item)
        return {'name': item.modeName, 'index': i};
    });

    $.each(convertedModes, function (i, item) {
        $('#modes').append(new Option(item.name, item.index));
    });
    updateWidgets();
}

// retrieve the mode info from the web server in JSON format
function getModes() {
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
        if (arg.status === 200) {
            console.log(typeof modes)
            modes.push(arg)
        }
    });

    ipcRenderer.on('getModesReply', function (event, arg) {
        console.log(arg)
        if (arg.status === 200) {
            limit = arg.amountOfModes;
        }
    });
}

function onAddSegment(event) {
    event.preventDefault();
    event.stopPropagation();
    if (segments.length > 9) return; // max 10 segments

    // calc the new segment's start led by adding one to the maximum stop led
    var start = 0;
    for (var i = 0; i < segments.length; i++) {
        if (segments[i].stop >= start) start = segments[i].stop + 1;
    }
    if (start > numPixels - 1) start = numPixels - 1;

    segments.push({
        start: start,
        stop: numPixels - 1,
        mode: 0,
        speed: 1000,
        options: 0,
        colors: ['#ff0000', '#00ff00', '#0000ff']
    });
    segmentIndex = segments.length - 1;
    updateWidgets();
}

function onDeleteSegment(event, index) {
    event.preventDefault();
    event.stopPropagation();
    segments.splice(index, 1);
    if (segmentIndex >= segments.length) segmentIndex = segments.length - 1;
    updateWidgets();
}

function onChangeSegment(elem) {
    elem.addClass("active").siblings().removeClass('active');
    segmentIndex = elem.index();
    updateWidgets();
}

function updateSegment() {
    segments[segmentIndex].start = parseInt(rangeSlider.noUiSlider.get()[0]);
    segments[segmentIndex].stop = parseInt(rangeSlider.noUiSlider.get()[1]);
    segments[segmentIndex].speed = parseInt(speedSlider.noUiSlider.get());
    segments[segmentIndex].mode = $('#modes').val();

    segments[segmentIndex].options = $('#reverse').prop('checked') ? 0x80 : 0;
    segments[segmentIndex].options |= $('#gamma').prop('checked') ? 0x08 : 0;
    segments[segmentIndex].options |= $('#fade').val() ? $('#fade').val() << 4 : 0;
    segments[segmentIndex].options |= $('#size').val() ? $('#size').val() << 1 : 0;

    segments[segmentIndex].colors[0] = $('#color0').val();
    segments[segmentIndex].colors[1] = $('#color1').val();
    segments[segmentIndex].colors[2] = $('#color2').val();
    updateWidgets();
}

// update GUI widgets
function updateWidgets() {
    // recreate the segment list HTML
    $("#segmentList").empty();
    for (var i = 0; i < segments.length; i++) {
        $("#segmentList").append(
            '<li class="grid-x align-justify segment-item padding-1" onclick="onChangeSegment($(this))">' +
                '<span>' + segments[i].start + ' - ' + segments[i].stop + ' : ' + getModeName(segments[i].mode) + '</span>' +
                '<span onclick="onDeleteSegment(event, ' + i + ')"><i class="fas fa-trash-alt text-primary"></i></span>' +
            '</li>');
    }
    $("#segmentList li").eq(segmentIndex).addClass('segment-item-selected');

    // update the UI widgets with the current segment's data
    if (segments.length > 0) {
        rangeSlider.noUiSlider.set([segments[segmentIndex].start, segments[segmentIndex].stop]);
        speedSlider.noUiSlider.set(segments[segmentIndex].speed);
        $('#modes').val(segments[segmentIndex].mode);
        $('#fade').val((segments[segmentIndex].options & 0x70) >> 4);
        $('#size').val((segments[segmentIndex].options & 0x06) >> 1);

//      $('#reverse').prop('checked', Boolean(segments[segmentIndex].options & 0x80));
//      $('#gamma').prop('checked',   Boolean(segments[segmentIndex].options & 0x08));
        document.getElementById('reverse').checked = Boolean(segments[segmentIndex].options & 0x80);
        document.getElementById('gamma').checked = Boolean(segments[segmentIndex].options & 0x08);

        $('#color0').val(segments[segmentIndex].colors[0]);
        $('#color1').val(segments[segmentIndex].colors[1]);
        $('#color2').val(segments[segmentIndex].colors[2]);
    }
}

// retrieve the segment info from the web server in JSON format
function onLoad() {
    $.getJSON("getsegments", function (data) {
        pin = data.pin;
        numPixels = data.numPixels;
        brightness = data.brightness;

        segments.length = 0;
        segmentIndex = 0;
        $.each(data.segments, function (i, item) {
            segments.push({
                start: item.start,
                stop: item.stop,
                mode: item.mode,
                speed: item.speed,
                options: item.options,
                // transform the color info from a number into '#000000' format
                colors: [ // convert int colors to HTML representation
                    '#' + ('000000' + item.colors[0].toString(16)).substr(-6),
                    '#' + ('000000' + item.colors[1].toString(16)).substr(-6),
                    '#' + ('000000' + item.colors[2].toString(16)).substr(-6),
                ]
            });
        });

        updateWidgets();
    });
}

// send the segment info to the web server in JSON format
function onSave() {
    json = '{';
    json += '"segments":[';
    $.each(segments, function (i, item) {
        if (i != 0) json += ',';
        json += '{';
        json += '"start":' + item.start;
        json += ',"stop":' + item.stop;
        json += ',"mode":' + item.mode;
        json += ',"speed":' + item.speed;
        json += ',"options":' + item.options;
        json += ',"colors":[' +
            // transform the color info from '#000000' format into a number
            parseInt(colorPicker.colors[0].hexString.replace('#', ''), 16) + ',' +
            parseInt(colorPicker.colors[1].hexString.replace('#', ''), 16) + ',' +
            parseInt(colorPicker.colors[2].hexString.replace('#', ''), 16) + ']';
        json += "}";
    });
    json += "]}";
    ipcRenderer.send('setSegment', JSON.stringify(json));
    ipcRenderer.on('setSegmentReply', function (event, response){
        console.log('setSegmentReply')
        console.log(response);
    })
}

function onPause() { // pause the animation
    ipcRenderer.send("pause", undefined);
    ipcRenderer.on("pauseReply", function (event, response) {
        console.log("pause: ")
        console.log(response)
    })
}

function onResume() { // resume from pause
    ipcRenderer.send("resume", undefined);
    ipcRenderer.on("resumeReply", function (event, response) {
        console.log("resume: ")
        console.log(response)
    })
}

function onStop() { // stop animation
    ipcRenderer.send("stop", undefined);
    ipcRenderer.on("stopReply", function (event, response) {
        console.log("stop: ")
        console.log(response)
    })
}

function onStart() { // start animation
    ipcRenderer.send("run", undefined);
    ipcRenderer.on("runReply", function (event, response) {
        console.log("run: ")
        console.log(response)
    })
}

function getModeName(index) {
    var name = "";
    $("#modes option").each(function (i, item) {
        if (index == item.value) {
            name = item.text;
            return false; // exit the each loop
        }
    });
    return name;
}
