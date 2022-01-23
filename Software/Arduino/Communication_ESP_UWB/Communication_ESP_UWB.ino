
#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>

//Wifi paramters
const char* ssid = "RT-AC68U";
const char* password = "ASUS_HEI";

//Your Domain name with URL path or IP address with path
const char* serverName = "http://192.168.2.176/tags/update/positions";

//Gloabl variable
char incomingByte;
String frame = "";
char* delimitedFrame;
int x=0;
String frameJson = "";

//Setup method that will connecet to the wifi and then start to mesure the distance
void setup() {
  disableCore0WDT();
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  if(Serial.available())
  {
    clearSerialBuffer();
  }
  delay(5000);
  Serial.print("AT+switchdis=1\r\n");
  clearSerialBuffer();
  clearSerialBuffer();
}
//Method to clear the serial buffer and save the value
void clearSerialBuffer(){
  while(Serial.available()<=0);
  frame="";
  while(Serial.available())
  {
    incomingByte=Serial.read();
    if(incomingByte!='\n' && incomingByte!='\r' && incomingByte!='a' && incomingByte!='n')
    {
      frame+=incomingByte;
    }
  }
}
//method that will create a json fram
void createJsonFrame()
{
  delimitedFrame = strtok((char*)frame.c_str(),":m");
  frameJson="{\"tagId\":0,\"BeaconDetected\":[";
  while ( delimitedFrame )
  {
      if((x != 0) && ((x%2) == 0))
      {

        frameJson += ",";
      }
    x++;
    if(x%2==0)
    {
        frameJson+= "\"dist\":" + String(delimitedFrame) + "}";

    }
    else
    {
        frameJson+="{\"id\":" + String(delimitedFrame) + ",";
    }
    // next
    delimitedFrame = strtok( NULL, ":m");
  }
  frameJson+="]}";
  x=0;
}
//while(1)
void loop() {
  //if connected
    if(WiFi.status()== WL_CONNECTED){
    frame = ""; //clear string
    clearSerialBuffer();//clear serial buffer
    createJsonFrame();//create json frame

      WiFiClient client;
      HTTPClient http;

      //begin http commhunication
      http.begin(client, serverName);
      //json encoding
      http.addHeader("Content-Type", "application/json");
      //send our request post
      int httpResponseCode = http.POST(frameJson);
      //get response
      if(httpResponseCode>0){
        String payLoad = http.getString();
       }
      // Free resources
      http.end();

    }
}
