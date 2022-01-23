# Location IOT - Back end API

## Prerequisites

- Node.js
- InfluxDB
- Connect your computer to the RT-AC68U wifi

## Getting started

Follow these steps at the command line:

### 1. Clone and Install

```bash
git clone https://github.com/SuperBeurk/LocalisationPGA.git
cd LocalisationPGA/Software/BackEnd/ServeurBackEnd/api
npm install
```

### 2. Start InfluxDB
- Open a new terminal
- Go to your folder where your influx database is located
```bash
.\influxd.exe
```
### 2.5 Add existing tags and beacons to db (if you don't have them)
```bash
cd LocalisationPGA/Software/BackEnd/ServeurBackEnd/api
npm run configDB.js
```
### 3. Run the solution
```bash
npm run start
```
### 4. Open the web page
```bash
cd LocalisationPGA\Software\FrontEnd\Web
.\tagFinder.html
```
### 5. Test
- Plug all your tags and beacons
- You can now see the tag moving on the web page.
