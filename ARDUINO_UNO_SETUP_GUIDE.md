# CareSure Smart Medicine Box - Arduino Uno Prototype Setup Guide

## 📋 Overview

This guide will help you build a working prototype of the CareSure Smart Medicine Box using your **Arduino Uno** and existing sensors. Since Arduino Uno doesn't have built-in WiFi, we'll show you how to add WiFi connectivity.

---

## 🎯 What You Have vs What You Need

### ✅ What You Already Have:
- Arduino Uno
- Some sensors (we'll work with whatever you have!)

### 📦 What You Need to Add:

#### Option 1: ESP8266 WiFi Module (Recommended - Cheapest)
- **ESP8266-01** or **ESP8266 NodeMCU** (~$2-5)
- Connects to Arduino via Serial communication
- Uses AT commands or Arduino libraries

#### Option 2: Ethernet Shield (More Stable)
- **Arduino Ethernet Shield** (~$15-20)
- Requires Ethernet cable connection
- More stable but less portable

#### Option 3: ESP32 Development Board (Best Option - Upgrade)
- **ESP32 Development Board** (~$5-10)
- Has WiFi built-in, more powerful than Uno
- Can replace Arduino Uno entirely

---

## 🔌 Hardware Setup

### Step 1: Choose Your WiFi Solution

#### **If Using ESP8266-01 with Arduino Uno:**

**Wiring ESP8266-01 to Arduino Uno:**
```
ESP8266-01    →    Arduino Uno
VCC           →    3.3V (IMPORTANT: Use 3.3V, NOT 5V!)
GND           →    GND
TX            →    Pin 10 (SoftwareSerial RX)
RX            →    Pin 11 (SoftwareSerial TX)
CH_PD         →    3.3V (Enable pin)
```

**Important Notes:**
- ESP8266-01 runs on 3.3V, NOT 5V! Using 5V will damage it.
- Use a voltage divider for RX pin (Arduino 5V → ESP8266 3.3V)
- Or use a logic level converter

#### **If Using ESP8266 NodeMCU:**
- NodeMCU can work standalone (no Arduino Uno needed)
- Or connect to Arduino Uno via Serial

#### **If Using Ethernet Shield:**
- Simply plug the Ethernet Shield on top of Arduino Uno
- Connect Ethernet cable to your router

---

### Step 2: Connect Your Sensors

Since you have some sensors already, we'll adapt the code to work with what you have. Here's a flexible wiring guide:

#### **Lid Sensor (Use any sensor you have):**
```
Sensor Type Options:
- Hall Effect Sensor (A3144)
- Reed Switch
- Magnetic Switch
- Simple Push Button (for testing)

Wiring:
VCC → 5V (or 3.3V for some sensors)
GND → GND
Signal → Digital Pin 2 (with 10kΩ pull-up resistor)
```

#### **Compartment Sensors (Use what you have):**
```
You can start with just 1-2 sensors for testing!

Options:
- Micro-switches
- Push buttons
- Reed switches
- Hall effect sensors
- Any digital sensor

Wiring (for each sensor):
VCC → 5V
GND → GND
Signal → Digital Pin (4, 5, 6, 7, 8, 9, 12, 13)
        Use 10kΩ pull-up resistor on each
```

#### **LEDs (Optional but Recommended):**
```
Green LEDs (for correct dose):
- Anode → Digital Pin (with 220Ω resistor) → Pin 3, 5, 6, 9 (PWM pins)
- Cathode → GND

Red LEDs (for missed/wrong):
- Anode → Digital Pin (with 220Ω resistor) → Pin 10, 11
- Cathode → GND

Start with 2-4 LEDs if you don't have 16!
```

#### **Buzzer (Optional):**
```
Piezo Buzzer:
- Positive → Digital Pin 13
- Negative → GND
```

---

## 💻 Software Setup

### Step 1: Install Arduino IDE

1. Download from: https://www.arduino.cc/en/software
2. Install Arduino IDE
3. Open Arduino IDE

### Step 2: Install Required Libraries

Go to **Sketch → Include Library → Manage Libraries** and install:

1. **ESP8266WiFi** (if using ESP8266)
   - Or use AT command library: **SoftwareSerial**

2. **Ethernet** (if using Ethernet Shield)
   - Usually comes built-in with Arduino IDE

3. **ArduinoJson** by Benoit Blanchon
   - Version 6.x or 7.x

4. **TimeLib** by Michael Margolis
   - For time management

5. **WiFiManager** (Optional - for easy WiFi setup)
   - By tzapu

### Step 3: Configure Board Settings

1. Go to **Tools → Board → Arduino AVR Boards → Arduino Uno**
2. Select correct **Port** (Tools → Port)
3. Set **Programmer** to "Arduino as ISP" (if needed)

---

## 📝 Code Implementation

### Basic Code Structure for Arduino Uno + ESP8266

```cpp
#include <SoftwareSerial.h>
#include <ArduinoJson.h>

// ESP8266 WiFi Module (SoftwareSerial)
SoftwareSerial esp8266(10, 11); // RX, TX pins

// Sensor Pins (Adjust based on what you have!)
const int LID_SENSOR = 2;
const int COMPARTMENT_1 = 4;
const int COMPARTMENT_2 = 5;
// Add more pins as needed: 6, 7, 8, 9, 12, 13

// LED Pins (Adjust based on what you have!)
const int GREEN_LED_1 = 3;  // PWM pin
const int RED_LED_1 = 6;    // PWM pin
// Add more LEDs as needed

// Buzzer Pin
const int BUZZER = 13;

// WiFi Credentials
const char* SSID = "YOUR_WIFI_SSID";
const char* PASSWORD = "YOUR_WIFI_PASSWORD";

// API Endpoint (Replace with your backend URL)
const char* API_URL = "http://your-backend-url.com/api/devices/events";

// Device ID (Use a unique identifier)
String DEVICE_ID = "ARDUINO_UNO_001"; // Change this!

// Variables
unsigned long lastCheck = 0;
const unsigned long CHECK_INTERVAL = 1000; // Check sensors every 1 second

void setup() {
  // Initialize Serial
  Serial.begin(115200);
  esp8266.begin(115200);
  
  // Initialize pins
  pinMode(LID_SENSOR, INPUT_PULLUP);
  pinMode(COMPARTMENT_1, INPUT_PULLUP);
  pinMode(COMPARTMENT_2, INPUT_PULLUP);
  
  pinMode(GREEN_LED_1, OUTPUT);
  pinMode(RED_LED_1, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  
  // Wait for Serial
  delay(1000);
  Serial.println("CareSure Arduino Uno Prototype");
  Serial.println("Initializing...");
  
  // Initialize ESP8266
  initESP8266();
  
  Serial.println("Setup complete!");
}

void loop() {
  // Check sensors periodically
  if (millis() - lastCheck >= CHECK_INTERVAL) {
    lastCheck = millis();
    
    // Check lid sensor
    if (digitalRead(LID_SENSOR) == LOW) {
      Serial.println("Lid opened!");
      sendEvent("lid_opened", 0);
      delay(500); // Debounce
    }
    
    // Check compartment sensors
    if (digitalRead(COMPARTMENT_1) == LOW) {
      Serial.println("Compartment 1 opened!");
      sendEvent("compartment_opened", 1);
      digitalWrite(GREEN_LED_1, HIGH);
      delay(500); // Debounce
      digitalWrite(GREEN_LED_1, LOW);
    }
    
    if (digitalRead(COMPARTMENT_2) == LOW) {
      Serial.println("Compartment 2 opened!");
      sendEvent("compartment_opened", 2);
      digitalWrite(RED_LED_1, HIGH);
      delay(500); // Debounce
      digitalWrite(RED_LED_1, LOW);
    }
    
    // Add more compartment checks as needed
  }
  
  // Check for incoming data from ESP8266
  if (esp8266.available()) {
    Serial.write(esp8266.read());
  }
  
  // Check for incoming Serial commands
  if (Serial.available()) {
    esp8266.write(Serial.read());
  }
}

// Initialize ESP8266 WiFi Module
void initESP8266() {
  Serial.println("Initializing ESP8266...");
  
  // Reset ESP8266
  sendATCommand("AT+RST", 2000);
  
  // Set to Station Mode
  sendATCommand("AT+CWMODE=1", 2000);
  
  // Connect to WiFi
  String cmd = "AT+CWJAP=\"" + String(SSID) + "\",\"" + String(PASSWORD) + "\"";
  sendATCommand(cmd, 10000);
  
  // Check connection
  sendATCommand("AT+CWJAP?", 2000);
  
  // Get IP address
  sendATCommand("AT+CIFSR", 2000);
  
  Serial.println("ESP8266 initialized!");
}

// Send AT Command to ESP8266
String sendATCommand(String command, int timeout) {
  String response = "";
  esp8266.println(command);
  
  unsigned long startTime = millis();
  while (millis() - startTime < timeout) {
    if (esp8266.available()) {
      char c = esp8266.read();
      response += c;
    }
  }
  
  Serial.print("ESP8266: ");
  Serial.println(response);
  return response;
}

// Send Event to Backend API
void sendEvent(String eventType, int compartment) {
  Serial.print("Sending event: ");
  Serial.print(eventType);
  Serial.print(" - Compartment: ");
  Serial.println(compartment);
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["device_id"] = DEVICE_ID;
  doc["event_type"] = eventType;
  doc["compartment"] = compartment;
  doc["timestamp"] = millis();
  
  String jsonPayload;
  serializeJson(doc, jsonPayload);
  
  // Send HTTP POST request via ESP8266
  String cmd = "AT+CIPSTART=\"TCP\",\"";
  // Extract host from API_URL
  String host = extractHost(API_URL);
  String path = extractPath(API_URL);
  cmd += host + "\",80";
  
  sendATCommand(cmd, 5000);
  
  // Send HTTP POST
  String httpRequest = "POST " + path + " HTTP/1.1\r\n";
  httpRequest += "Host: " + host + "\r\n";
  httpRequest += "Content-Type: application/json\r\n";
  httpRequest += "Content-Length: " + String(jsonPayload.length()) + "\r\n";
  httpRequest += "\r\n";
  httpRequest += jsonPayload;
  
  cmd = "AT+CIPSEND=" + String(httpRequest.length());
  sendATCommand(cmd, 2000);
  
  esp8266.print(httpRequest);
  
  delay(2000);
  
  // Close connection
  sendATCommand("AT+CIPCLOSE", 2000);
}

// Helper function to extract host from URL
String extractHost(String url) {
  // Simple extraction - adjust based on your URL format
  // Example: "http://example.com/api" -> "example.com"
  url.remove(0, 7); // Remove "http://"
  int slashIndex = url.indexOf('/');
  if (slashIndex > 0) {
    return url.substring(0, slashIndex);
  }
  return url;
}

// Helper function to extract path from URL
String extractPath(String url) {
  // Example: "http://example.com/api/devices" -> "/api/devices"
  int slashIndex = url.indexOf('/', 7);
  if (slashIndex > 0) {
    return url.substring(slashIndex);
  }
  return "/";
}
```

---

## 🔧 Alternative: Using Ethernet Shield

If you're using Ethernet Shield instead of ESP8266, here's a simpler approach:

```cpp
#include <Ethernet.h>
#include <ArduinoJson.h>
#include <SPI.h>

// MAC address (should be unique)
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };

// Sensor pins (same as above)
const int LID_SENSOR = 2;
const int COMPARTMENT_1 = 4;
const int COMPARTMENT_2 = 5;

// API endpoint
const char* API_URL = "http://your-backend-url.com/api/devices/events";
String DEVICE_ID = "ARDUINO_UNO_001";

EthernetClient client;

void setup() {
  Serial.begin(9600);
  
  // Initialize Ethernet
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    // Try with static IP
    IPAddress ip(192, 168, 1, 177);
    Ethernet.begin(mac, ip);
  }
  
  Serial.print("IP Address: ");
  Serial.println(Ethernet.localIP());
  
  // Initialize pins
  pinMode(LID_SENSOR, INPUT_PULLUP);
  pinMode(COMPARTMENT_1, INPUT_PULLUP);
  pinMode(COMPARTMENT_2, INPUT_PULLUP);
}

void loop() {
  // Check sensors
  if (digitalRead(LID_SENSOR) == LOW) {
    sendEvent("lid_opened", 0);
    delay(500);
  }
  
  if (digitalRead(COMPARTMENT_1) == LOW) {
    sendEvent("compartment_opened", 1);
    delay(500);
  }
  
  delay(100);
}

void sendEvent(String eventType, int compartment) {
  if (client.connect(extractHost(API_URL).c_str(), 80)) {
    // Create JSON
    StaticJsonDocument<200> doc;
    doc["device_id"] = DEVICE_ID;
    doc["event_type"] = eventType;
    doc["compartment"] = compartment;
    doc["timestamp"] = millis();
    
    String jsonPayload;
    serializeJson(doc, jsonPayload);
    
    // Send HTTP POST
    client.print("POST ");
    client.print(extractPath(API_URL));
    client.println(" HTTP/1.1");
    client.print("Host: ");
    client.println(extractHost(API_URL));
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(jsonPayload.length());
    client.println();
    client.print(jsonPayload);
    
    delay(1000);
    client.stop();
  }
}
```

---

## 🔗 Connecting to CareSure Backend

### Step 1: Register Your Device

First, register your Arduino Uno device with the backend:

**API Endpoint:** `POST /api/devices/register`

**Request Body:**
```json
{
  "device_id": "ARDUINO_UNO_001",
  "device_name": "Arduino Uno Prototype",
  "device_type": "prototype"
}
```

**Response:**
```json
{
  "device_id": "ARDUINO_UNO_001",
  "auth_token": "your_auth_token_here",
  "status": "registered"
}
```

### Step 2: Update Code with Auth Token

Add authentication to your HTTP requests:

```cpp
String AUTH_TOKEN = "your_auth_token_here";

// In sendEvent function, add header:
httpRequest += "Authorization: Bearer " + AUTH_TOKEN + "\r\n";
```

### Step 3: API Endpoints to Use

1. **Send Events:** `POST /api/devices/events`
   ```json
   {
     "device_id": "ARDUINO_UNO_001",
     "event_type": "compartment_opened",
     "compartment": 1,
     "timestamp": 1234567890
   }
   ```

2. **Get Schedule:** `GET /api/devices/schedule?device_id=ARDUINO_UNO_001`
   - Poll this endpoint to get medication schedules
   - Check if it's time for a dose
   - Light up appropriate LED
   - Sound buzzer

3. **Update Status:** `POST /api/devices/status`
   ```json
   {
     "device_id": "ARDUINO_UNO_001",
     "battery_level": 100,
     "wifi_signal": -50,
     "status": "online"
   }
   ```

---

## 🧪 Testing Your Prototype

### Step 1: Test Sensors

```cpp
void testSensors() {
  Serial.println("=== Sensor Test ===");
  Serial.print("Lid Sensor: ");
  Serial.println(digitalRead(LID_SENSOR));
  Serial.print("Compartment 1: ");
  Serial.println(digitalRead(COMPARTMENT_1));
  Serial.print("Compartment 2: ");
  Serial.println(digitalRead(COMPARTMENT_2));
  delay(1000);
}
```

### Step 2: Test WiFi Connection

```cpp
void testWiFi() {
  sendATCommand("AT+CWJAP?", 2000);
  sendATCommand("AT+CIFSR", 2000);
}
```

### Step 3: Test API Connection

Send a test event and check Serial Monitor for response.

---

## 📱 Linking Device to CareSure App

Since you don't have a QR code yet, you can manually link the device:

1. **Get Device ID from Serial Monitor**
   - Your device ID is: `ARDUINO_UNO_001` (or whatever you set)

2. **In CareSure App:**
   - Go to "Add Device"
   - Select "Manual Entry"
   - Enter Device ID: `ARDUINO_UNO_001`
   - Device should appear in your dashboard

3. **Alternative: Generate Test QR Code**
   - Use any QR code generator
   - Encode: `{"device_id": "ARDUINO_UNO_001"}`
   - Print and scan with app

---

## 🎯 Quick Start Checklist

- [ ] Arduino Uno connected to computer
- [ ] ESP8266 or Ethernet Shield connected
- [ ] Sensors wired (at least 1-2 for testing)
- [ ] LEDs connected (optional, at least 1-2)
- [ ] Arduino IDE installed
- [ ] Libraries installed (ArduinoJson, etc.)
- [ ] WiFi credentials updated in code
- [ ] API URL updated in code
- [ ] Device ID set (unique identifier)
- [ ] Code uploaded to Arduino
- [ ] Serial Monitor open (115200 baud)
- [ ] Backend API running and accessible
- [ ] Device registered with backend
- [ ] Test event sent successfully

---

## 🐛 Troubleshooting

### ESP8266 Not Responding
- Check 3.3V power (NOT 5V!)
- Verify TX/RX connections (may need to swap)
- Check baud rate (try 9600 or 115200)
- Reset ESP8266 (unplug/replug power)

### WiFi Not Connecting
- Verify SSID and password
- Check WiFi signal strength
- Try different WiFi network
- Check AT commands in Serial Monitor

### API Not Receiving Events
- Verify API URL is correct
- Check backend is running
- Verify device is registered
- Check auth token is correct
- Monitor Serial output for errors

### Sensors Not Working
- Check wiring (VCC, GND, Signal)
- Verify pull-up resistors
- Test with simple button first
- Check pin numbers in code match wiring

---

## 📊 Minimal Working Example

If you want to start super simple, here's a minimal version:

```cpp
#include <SoftwareSerial.h>

SoftwareSerial esp8266(10, 11);

const int BUTTON = 2; // Use any button/sensor you have

void setup() {
  Serial.begin(115200);
  esp8266.begin(115200);
  pinMode(BUTTON, INPUT_PULLUP);
  
  // Connect to WiFi
  delay(1000);
  esp8266.println("AT+CWJAP=\"YOUR_WIFI\",\"YOUR_PASSWORD\"");
  delay(10000);
}

void loop() {
  if (digitalRead(BUTTON) == LOW) {
    Serial.println("Button pressed!");
    
    // Send simple HTTP request
    esp8266.println("AT+CIPSTART=\"TCP\",\"your-backend.com\",80");
    delay(2000);
    esp8266.println("AT+CIPSEND=50");
    delay(1000);
    esp8266.print("GET /api/test HTTP/1.1\r\nHost: your-backend.com\r\n\r\n");
    delay(2000);
    esp8266.println("AT+CIPCLOSE");
    
    delay(1000);
  }
}
```

---

## 🚀 Next Steps

1. **Start Simple:** Get 1 sensor working first
2. **Add WiFi:** Connect to your network
3. **Test API:** Send one event successfully
4. **Add More Sensors:** Gradually add compartments
5. **Add LEDs:** Visual feedback
6. **Add Buzzer:** Audio alerts
7. **Implement Schedule:** Poll for medication times
8. **Create Enclosure:** 3D print or use cardboard box

---

## 📚 Additional Resources

- **Arduino Reference:** https://www.arduino.cc/reference/en/
- **ESP8266 AT Commands:** https://www.espressif.com/sites/default/files/documentation/4a-esp8266_at_instruction_set_en.pdf
- **ArduinoJson Documentation:** https://arduinojson.org/
- **CareSure Backend API Docs:** (Your API documentation)

---

## 💡 Tips

1. **Start with Serial Monitor:** Always debug with Serial.print()
2. **Test One Thing at a Time:** Don't try to do everything at once
3. **Use What You Have:** Adapt the code to your sensors
4. **Incremental Development:** Add features one by one
5. **Document Your Wiring:** Take photos or draw diagrams
6. **Version Control:** Save working versions of code

---

## 📞 Support

If you encounter issues:
1. Check Serial Monitor output
2. Verify all connections
3. Test components individually
4. Review error messages
5. Check backend API logs

---

**Good luck with your prototype! 🎉**

