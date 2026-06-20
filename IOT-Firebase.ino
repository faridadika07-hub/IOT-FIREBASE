/*************************************************
 * SMART HOME IoT
 * ESP32 + DHT11 + 4 Relay
 * Firebase Realtime Database
 *************************************************/

#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>

// Token helper
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

/*************************************************
 * WIFI
 *************************************************/
#define WIFI_SSID "Xv"
#define WIFI_PASSWORD "123456789"

/*************************************************
 * FIREBASE
 *************************************************/
#define API_KEY "AIzaSyDXlt6hccFdWgjldt-3z4yVyhfJ756yBDQ"

#define DATABASE_URL "https://iot-firebase-6f3eb-default-rtdb.asia-southeast1.firebasedatabase.app"

/*
 * Buat akun Authentication > Sign-in Method > Email/Password
 */
#define USER_EMAIL "admin777@gmail.com"
#define USER_PASSWORD "admin777"

/*************************************************
 * DHT11
 *************************************************/
#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

/*************************************************
 * RELAY
 *************************************************/
#define RELAY1 14
#define RELAY2 27
#define RELAY3 26
#define RELAY4 25

/*************************************************
 * FIREBASE OBJECT
 *************************************************/
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

bool signupOK = false;

unsigned long lastSensor = 0;

/*************************************************
 * SETUP
 *************************************************/
void setup()
{
  Serial.begin(115200);

  pinMode(RELAY1, OUTPUT);
  pinMode(RELAY2, OUTPUT);
  pinMode(RELAY3, OUTPUT);
  pinMode(RELAY4, OUTPUT);

  // Relay Active LOW
  digitalWrite(RELAY1, HIGH);
  digitalWrite(RELAY2, HIGH);
  digitalWrite(RELAY3, HIGH);
  digitalWrite(RELAY4, HIGH);

  dht.begin();

  Serial.println();
  Serial.println("Connecting WiFi...");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi Connected");
  Serial.println(WiFi.localIP());

  /*************************************************
   * FIREBASE
   *************************************************/
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;

  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;

  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("Firebase Connected");
}

/*************************************************
 * LOOP
 *************************************************/
void loop()
{
  if (Firebase.ready())
  {
    bacaRelay();

    if (millis() - lastSensor > 5000)
    {
      lastSensor = millis();

      kirimSensor();
    }
  }
}

/*************************************************
 * KIRIM SENSOR
 *************************************************/
void kirimSensor()
{
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  if (isnan(temp) || isnan(hum))
  {
    Serial.println("DHT Error");
    return;
  }

  Serial.print("Temperature : ");
  Serial.println(temp);

  Serial.print("Humidity : ");
  Serial.println(hum);

  Firebase.RTDB.setFloat(
      &fbdo,
      "/sensor/temperature",
      temp);

  Firebase.RTDB.setFloat(
      &fbdo,
      "/sensor/humidity",
      hum);
}

/*************************************************
 * BACA STATUS RELAY DARI FIREBASE
 *************************************************/
void bacaRelay()
{
  if (Firebase.RTDB.getInt(&fbdo, "/relay/relay1"))
  {
    int state = fbdo.intData();

    if (state == 1)
      digitalWrite(RELAY1, LOW);
    else
      digitalWrite(RELAY1, HIGH);
  }

  if (Firebase.RTDB.getInt(&fbdo, "/relay/relay2"))
  {
    int state = fbdo.intData();

    if (state == 1)
      digitalWrite(RELAY2, LOW);
    else
      digitalWrite(RELAY2, HIGH);
  }

  if (Firebase.RTDB.getInt(&fbdo, "/relay/relay3"))
  {
    int state = fbdo.intData();

    if (state == 1)
      digitalWrite(RELAY3, LOW);
    else
      digitalWrite(RELAY3, HIGH);
  }

  if (Firebase.RTDB.getInt(&fbdo, "/relay/relay4"))
  {
    int state = fbdo.intData();

    if (state == 1)
      digitalWrite(RELAY4, LOW);
    else
      digitalWrite(RELAY4, HIGH);
  }
}