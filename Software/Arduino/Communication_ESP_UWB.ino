
#include <WiFi.h>
#include <HTTPClient.h>
#include <Arduino_JSON.h>

const char* ssid = "iPhone";
const char* password = "Raphael58";

//Your Domain name with URL path or IP address with path
const char* serverName = "http://172.20.10.11/tags/update/positions";

char incomingByte;
String frame = "";
char* delimitedFrame;
int x=0;
String frameJson = "";

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
void createJsonFrame()
{
  delimitedFrame = strtok((char*)frame.c_str(),":m");
  frameJson="{\"tagId\":1,\"BeaconDetected\":[";
  while ( delimitedFrame )
  {
      if((x != 0) && ((x%2) == 0))
      {
    
        frameJson += ",";
      }
    x++;
    // un morceau a traiter
    if(x%2==0)
    {
        frameJson+= "\"dist\":" + String(delimitedFrame) + "}";

    }
    else
    {
        frameJson+="{\"id\":" + String(delimitedFrame) + ",";
    }
    // au suivant
    delimitedFrame = strtok( NULL, ":m");
  }
  frameJson+="]}";
  x=0;
}
void loop() {
    if(WiFi.status()== WL_CONNECTED){
    //Start mesuring distance
    frame = "";
    clearSerialBuffer();
    createJsonFrame();
    //Serial.print(frameJson);
    //Check WiFi connection status
    
      WiFiClient client;
      HTTPClient http;
    
      // Your Domain name with URL path or IP address with path
      http.begin(client, serverName);
      // If you need an HTTP request with a content type: application/json, use the following:
      http.addHeader("Content-Type", "application/json");
      int httpResponseCode = http.POST(frameJson);
      if(httpResponseCode>0){
        String payLoad = http.getString(); 
       }              
      // Free resources
      http.end();
      
    }
}
