const AppError = require("../utils/appError");
const method = require("./function");
const db = require("../database");
const {Point} = require("@influxdata/influxdb-client");
const {myOrg, myClient} = require("../database");
const {reject} = require("delay");
require("./function");

exports.getAll = async (req, res, next) => {
    var retVal = [];
    var myJsonFrame= "{\"Beacons\":[";
    for(var i = 0; i<=10;i++) //10 est max tag
    {
        retVal[i] = await method.queryBeacon(i,'2018-05-22T23:30:00Z',true);
        if(retVal[i][1].length > 0)
        {
            //Add to json
            if(i>0)
            {
                myJsonFrame+=",{";
            }else {
                myJsonFrame += "{";
            }
            myJsonFrame += "\"id\":"+i+",\"posX\":"+retVal[i][1][0]+",\"posY\":"+retVal[i][1][1]+",\"room\":"+retVal[i][1][2]+"}";
        }
    }
    myJsonFrame += "]}";
    console.log(myJsonFrame)
    res.send(JSON.parse(myJsonFrame));
};