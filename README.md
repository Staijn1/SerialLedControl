# SerialLedControl
Control a ledstrip using web. Made with electron.
**WORK IN PROGRESS**

## Requirements
1. Arduino Uno
2. WS2812B
3. Software to upload to the arduino ([Arduino IDE used](https://www.arduino.cc/en/Main/Software))
4. Node.js
##Getting started
### Uploading the sketch
Open the arduino IDE.
Go to sketch -> Include Library -> Manage library and install:
 1. The WS2812FX library.
 2. The arduinoJSON library.

Change LED_PIN to the correct pin on your Arduino UNO. My ledstrip is connected to pin 5.
Change the LED_COUNT to the correct amount of leds on your ledstrip.

Now we are almost ready to upload the sketch.
Go to tools, select the correct board and COM port. Remember this COM port, you will need it later on. 

When everything is dialed in, go ahead and upload the sketch using the arrow pointing right in the top left.

### Installing the application
Before we can install the application we need to open windows powershell as admin.
Navigate to the root of your drive using

`cd ..`

a couple of times.

Then run

`npm install --global --production windows-build-tools`

Now navigate into the electron_foundation_ledcontrol folder and run:

`npm install`

Now navigate into src/main.js and change the com port accordingly. Also make sure the baudrate is the same as declared in the arduino sketch.

We need to rebuild electron because of compatibility problems with the module serialport. Run
`.\node_modules\.bin\electron-rebuild.cmd`

from the root of the application project. This is all using the terminal.
## Running
To run the application from a terminal or IDE, use

`electron .`

To run the application outside of the terminal, you can create a .exe file.
To do this, run

`electron-packager <sourcedir> <appname> --platform=<platform> --arch=<arch> [optional flags...]`

Read more [here](https://github.com/electron/electron-packager).
This should create a folder with an exe in it.
