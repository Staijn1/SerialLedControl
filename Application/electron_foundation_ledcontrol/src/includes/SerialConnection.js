const SerialPort = require("serialport")
const Readline = SerialPort.parsers.Readline

class SerialConnection {
    serialport;
    _port;
    _baudrate;
    _COM;
    _errorMessage;
    _receivedMessage;
    _isReading;

    constructor(baudrate, COM) {
        this.serialport = SerialPort;
        this._baudrate = baudrate;
        this._COM = COM;

        this.init(baudrate, COM);
    }

    init(baudrate, COM) {
        this._port = new SerialPort(COM, {
            baudRate: baudrate,
        });

        const parser = new Readline({delimiter: '\r\n'});
        this._port.pipe(parser)

        const self = this;
        this._port.on('error', function (err) {
            self.setErrorMessage(err);
        });

        let buffer = '';
        this._port.on('data', function (data) {
            buffer += data.toString();

            if (buffer.indexOf('}') !== -1) {
                try {
                    self._receivedMessage = JSON.parse(buffer);
                    console.log(buffer)
                } catch (e) {
                    self._errorMessage = self.setErrorMessage("Kan JSON niet inlezen\n" + e)
                }
                buffer = '';
            }
        })

        // The open event is always emitted
        // this._port.on('open', function() {
        //     self.send("setColor ")
        // })
    }

    getReceivedMessage() {
        return this._receivedMessage;
    }

    setErrorMessage(message) {
        const self = this;
        this._errorMessage = `<div class="callout alert">
            <h5>Error!</h5>
            <p>${message}</p>
        </div>`;

        // setTimeout(function () {
        //     self.unsetErrorMessage();
        // }, 10000);
    }

    unsetErrorMessage() {
        this._errorMessage = '';
    }

    getErrorMessage() {
        return this._errorMessage;
    }

    send(command) {
        const self = this;
        this._port.write(command + '\n', function (err) {
            if (err) {
                self.setErrorMessage(err.message)
            }
        })
    }

    setMode(mode){
        this.send("setMode " + mode);
    }

    getMode(mode){
        this.send('getMode ' + mode)
    }

    adjustBrightness(value){
        if (value === '-'){
            this.send('decreaseBrightness')
        } else{
            this.send('increaseBrightness')
        }
    }

    adjustSpeed(value){
        if (value === '-'){
            this.send('decreaseSpeed')
        } else{
            this.send('increaseSpeed')
        }

    }

    setLeds(amountOfLeds){
        this.send('setLeds ' + amountOfLeds)
    }

    setColor(color) {
        this.send("setColor 0x" + color)
    }

    getModes(){
        this.send('getModes')
    }

    pause(){
        this.send('pause')
    }

    resume(){
        this.send('resume')
    }

    run(){
        this.send('run')
    }

    stop(){
        this.send('stop')
    }

    getModeNames(){
        this.send('getModeNames')
    }

    setSegment(json){
        json = json.slice(1,-1)
        let toSend = 'setSegment ' + json.split("\\\"").join("\"");
        this.send(toSend)
        console.log(toSend)
    }
}

module.exports = SerialConnection;
