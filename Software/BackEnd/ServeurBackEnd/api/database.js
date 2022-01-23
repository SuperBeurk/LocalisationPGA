/*
  Fichier concernant la database
 */
const {InfluxDB} = require('@influxdata/influxdb-client')
const {Point} = require('@influxdata/influxdb-client')
const {HealthAPI} = require ('@influxdata/influxdb-client-apis')
const token = '6WMihwHcAVyNdPBYxHRie-Ay0wnU9svCXEOMQbjQMROM2q4QCPpM8dFthrsQ31jLR_AfmNnsunNDNA-nvhd8HQ=='
const org = 'HES'
const bucket = 'LocalisationIot'
const client = new InfluxDB({url: 'http://localhost:8086', token: token})
const healthAPI=new HealthAPI(client);

exports.myBucket = bucket;
exports.myPoint = Point;
exports.myClient = client;
exports.myOrg=org;

// Connection
//Connection à la database
exports.connect = async () => {
  console.log(healthAPI.getHealth());
}
