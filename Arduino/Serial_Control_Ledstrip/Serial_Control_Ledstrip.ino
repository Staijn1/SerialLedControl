//Usage:
//m <n> : select mode <n>
//
//b+    : increase brightness
//b-    : decrease brightness
//b <n> : set brightness to <n>
//
//s+    : increase speed
//s-    : decrease speed
//s <n> : set speed to <n>
//
//c 0x007BFF : set color to 0x007BFF
#include <WS2812FX.h>
#include <ArduinoJson.h>

int visualizerLeds = 0;
#include "customEffects/VUMeter.h"
//#include "customEffects/Oscillate.h"
//#include "customEffects/Popcorn.h"
//#include "customEffects/Rain.h"
//#include "customEffects/BlockDissolve.h"
//#include "customEffects/Fillerup.h"
//#include "customEffects/TriFade.h"
//#include "customEffects/TwinkleFox.h"
#define LED_COUNT 30
#define LED_PIN 5
#define MAX_NUM_CHARS 200 // maximum number of characters read from the Serial Monitor

// Parameter 1 = number of pixels in strip
// Parameter 2 = Arduino pin number (most are valid)
// Parameter 3 = pixel type flags, add together as needed:
//   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
//   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
//   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
//   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)
//   NEO_RGBW    Pixels are wired for RGBW bitstream (NeoPixel RGBW products)
WS2812FX ws2812fx = WS2812FX(LED_COUNT, LED_PIN, NEO_GRB + NEO_KHZ800);

char cmd[MAX_NUM_CHARS];       // char[] to store incoming serial commands
boolean cmd_complete = false;  // whether the command string is complete

const size_t capacity = JSON_OBJECT_SIZE(8);
void setup() {
  Serial.begin(19200);


  ws2812fx.init();
  ws2812fx.setBrightness(100);
  ws2812fx.setSpeed(1000);
  ws2812fx.setColor(0x000000);
  ws2812fx.setMode(FX_MODE_STATIC);
  ws2812fx.start();

  ws2812fx.setCustomMode(F("VuMeter"), vuMeter);
  //  ws2812fx.setCustomMode(F("Oscillate"), oscillate);
  //  ws2812fx.setCustomMode(F("Popcorn"), popcorn);
  //  ws2812fx.setCustomMode(F("Rain"), rain);
  //  ws2812fx.setCustomMode(F("BlockDissolve"), blockDissolve);
  //  ws2812fx.setCustomMode(F("Fillerup"), fillerup);
  //  ws2812fx.setCustomMode(F("Tri Fade"), triFade);
  //  ws2812fx.setCustomMode(F("Twinkle Fox"), twinkleFox);
}

void loop() {
  ws2812fx.service();
  if (cmd_complete) {
    process_command();
  }
}

/*
   Checks received command and calls corresponding functions.
*/

void process_command() {
  bool recognizedCommand = false;
  /*
    if (strcmp(cmd, "increaseBrightness") == 0) {
      ws2812fx.increaseBrightness(25);

      //    StaticJsonDocument<capacity>doc;
      //    doc["status"] = 200;
      //    doc["brightness"] = ws2812fx.getBrightness();
      //    serializeJson(doc, Serial);
      recognizedCommand = true;
    }

    if (strcmp(cmd, "decreaseBrightness") == 0) {
      ws2812fx.decreaseBrightness(25);

      //    StaticJsonDocument<capacity>doc;
      //    doc["status"] = 200;
      //    doc["brightness"] = ws2812fx.getBrightness();
      //    serializeJson(doc, Serial);
      recognizedCommand = true;
    }

    if (strncmp(cmd, "setBrightness ", 14) == 0) {
      uint8_t b = (uint8_t)atoi(cmd + 14);
      ws2812fx.setBrightness(b);

      //    StaticJsonDocument<capacity>doc;
      //    doc["status"] = 200;
      //    doc["brightness"] = ws2812fx.getBrightness();
      //    serializeJson(doc, Serial);
      recognizedCommand = true;
    }

    if (strcmp(cmd, "getBrightness ") == 0) {
      StaticJsonDocument<capacity>doc;
      doc["status"] = 200;
      doc["brightness"] = ws2812fx.getBrightness();
      serializeJson(doc, Serial);
      recognizedCommand = true;
    }

    if (strcmp(cmd, "increaseSpeed") == 0) {
      ws2812fx.setSpeed(ws2812fx.getSpeed() * 1.2);

      //    StaticJsonDocument<capacity>doc;
      //    doc["status"] = 200;
      //    doc["speed"] = ws2812fx.getSpeed();
      //    serializeJson(doc, Serial);

      recognizedCommand = true;
    }

    if (strcmp(cmd, "decreaseSpeed") == 0) {
      ws2812fx.setSpeed(ws2812fx.getSpeed() * 0.8);

      //    StaticJsonDocument<capacity>doc;
      //    doc["status"] = 200;
      //    doc["speed"] = ws2812fx.getSpeed();
      //    serializeJson(doc, Serial);
      recognizedCommand = true;
    }

    if (strncmp(cmd, "setSpeed ", 9) == 0) {
      uint16_t s = (uint16_t)atoi(cmd + 9);
      ws2812fx.setSpeed(s);

      //        StaticJsonDocument<capacity>doc;
      //        doc["status"] = 200;
      //        doc["speed"] = ws2812fx.getSpeed();
      //        serializeJson(doc, Serial);
      recognizedCommand = true;
    }

    if (strcmp(cmd, "getSpeed") == 0) {
      StaticJsonDocument<capacity>doc;
      doc["status"] = 200;
      doc["speed"] = ws2812fx.getSpeed();
      serializeJson(doc, Serial);
      recognizedCommand = true;
    }
  */
  if (strncmp(cmd, "setMode ", 8) == 0) {
    uint8_t m = (uint8_t)atoi(cmd + 8);
    if (m == 55) {
      ws2812fx.setSegment(0, 0, LED_COUNT - 1, vuMeter, ws2812fx.getColor(), 0, NO_OPTIONS);
    }
    ws2812fx.setMode(m);

    int modeNumber = ws2812fx.getMode();
    String modeName = ws2812fx.getModeName(ws2812fx.getMode());

    //    StaticJsonDocument<capacity>doc;
    //    doc["status"] = 200;
    //    doc["modeName"] = modeName;
    //    doc["modeNumber"] = modeNumber;
    //    serializeJson(doc, Serial);

    recognizedCommand = true;
  }
  /*

      if (strcmp(cmd, "getMode") == 0) {
        int modeNumber = ws2812fx.getMode();
        String modeName = ws2812fx.getModeName(ws2812fx.getMode());

        StaticJsonDocument<capacity>doc;
        doc["status"] = 200;
        doc["modeName"] = modeName;
        doc["modeNumber"] = modeNumber;
        serializeJson(doc, Serial);

        recognizedCommand = true;
      }
  */
  if (strncmp(cmd, "getMode ", 8) == 0) {
    const uint8_t m = (uint8_t)atoi(cmd + 8);

    StaticJsonDocument<capacity>doc;
    doc["modeName"] = ws2812fx.getModeName(m);
    doc["modeNumber"] = m;
    serializeJson(doc, Serial);

    recognizedCommand = true;
  }

  if (strcmp(cmd, "getModes") == 0) {
    StaticJsonDocument<capacity>doc;
    doc["amountOfModes"] = ws2812fx.getModeCount();
    serializeJson(doc, Serial);
    recognizedCommand = true;
  }


  if (strncmp(cmd, "setColor ", 9) == 0) {
    uint32_t c = (uint32_t)strtoul(cmd + 9, NULL, 16);
    ws2812fx.setColor(c);
    recognizedCommand = true;
  }

  if (strncmp(cmd, "setLeds ", 8) == 0) {
    visualizerLeds = (uint8_t)atoi(cmd + 8);
    recognizedCommand = true;
  }

  /*
    if (strcmp(cmd, "getColor") == 0) {
    StaticJsonDocument<capacity>doc;
    doc["status"] = 200;
    doc["color"] = convertColorToHex();
    serializeJson(doc, Serial);
    recognizedCommand = true;
    }*/

  if (strcmp(cmd, "pause") == 0) {
    //    StaticJsonDocument<capacity>doc;
    //    doc["status"] = 200;
    //    serializeJson(doc, Serial);
    ws2812fx.pause();
    recognizedCommand = true;
  }

  if (strcmp(cmd, "resume") == 0) {
    //    StaticJsonDocument<capacity>doc;
    //    doc["status"] = 200;
    //    serializeJson(doc, Serial);
    ws2812fx.resume();
    recognizedCommand = true;
  }

  if (strcmp(cmd, "run") == 0) {
    //    StaticJsonDocument<capacity>doc;
    //    doc["status"] = 200;
    //    serializeJson(doc, Serial);
    ws2812fx.start();
    recognizedCommand = true;
  }

  if (strcmp(cmd, "stop") == 0) {
    //    StaticJsonDocument<capacity>doc;
    //    doc["status"] = 200;
    //    serializeJson(doc, Serial);
    ws2812fx.stop();
    recognizedCommand = true;
  }

  if (strncmp(cmd, "setSegment ", 11) == 0) {
    processSetSegment();
    recognizedCommand = true;
  }

  if (!recognizedCommand) {
    StaticJsonDocument<capacity>doc;
    doc["status"] = 404;
    doc["message"] = "Command not found";
    serializeJson(doc, Serial);
  }

  cmd[0] = '\0';         // reset the commandstring
  cmd_complete = false;  // reset command complete
}

String convertColorToHex() {
  return String(ws2812fx.getColor(), HEX);
}


void processSetSegment() {
  const char* json = cmd + 11;
  StaticJsonDocument<240> jsondoc;

  DeserializationError error = deserializeJson(jsondoc, json);

  if (!error) {
    JsonObject root = jsondoc.as<JsonObject>();
    JsonArray segments = root["segments"];
    ws2812fx.stop();
    ws2812fx.setNumSegments(1); // reset number of segments

    for (int i = 0; i < segments.size(); i++) {
      JsonObject seg = segments[i];
      JsonArray colorsSent = seg["colors"];
      uint32_t _colors[] = {colorsSent[0], colorsSent[1], colorsSent[2]};
      uint8_t _options = seg["options"];
      ws2812fx.setSegment(i, seg["start"], seg["stop"], seg["mode"], _colors, seg["speed"], _options);
    }

    ws2812fx.start();
  } else {
    Serial.print(F("Could not parse JSON payload: "));
    Serial.println(error.c_str());
  }
}

/*
   Reads new input from serial to cmd string. Command is completed on \n
*/

void serialEvent(void) {
  static byte index = 0;
  while (Serial.available() > 0 && cmd_complete == false) {
    char rc = Serial.read();
    if (rc != '\n') {
      if (index < MAX_NUM_CHARS) {
        cmd[index++] = rc;
      }
    } else {
      cmd[index] = '\0'; // terminate the string
      index = 0;
      cmd_complete = true;
    }
  }
}
