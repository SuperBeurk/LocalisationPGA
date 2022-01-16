const AppError = require("../utils/appError");
const method = require("./function");
const db = require("../database");
const {Point} = require("@influxdata/influxdb-client");
const {myOrg, myClient} = require("../database");
const {reject} = require("delay");
require("./function");
const {writeBeaconPosition} = require("./function");

exports.getHistory = async (req,res,next) =>{
    var myJsonFrame = "{\"TagHistory\": [{\"tag1\": [{\"id\":0,\"posX\":10,\"posY\":8,\"room\":0},{\"id\":0,\"posX\":7,\"posY\":5,\"room\":0}], \"tag2\": [{\"id\":1,\"posX\":4,\"posY\":4,\"room\":0},{\"id\":1,\"posX\":2,\"posY\":1,\"room\":0}]}]}"
    res.send(JSON.parse(myJsonFrame));
}
exports.liveTracking = async(req,res,next)=>{
    var retVal = [];
    var myJsonFrame= "{\"Tags\":[";
    for(var i = 0; i<req.query.tags.length;i++) //10 est max tag
    {
        retVal[i] = await method.queryTag(parseInt(req.query.tags[i]),req.query.filter,true);
        if(retVal[i][1].length > 0)
        {
            //Add to json
            if(i>0)
            {
                myJsonFrame+=",{";
            } else {
                myJsonFrame += "{";
            }
            myJsonFrame += "\"id\":"+req.query.tags[i]+",\"posX\":"+retVal[i][1][0]+",\"posY\":"+retVal[i][1][1]+",\"room\":"+retVal[i][1][2]+"}";
        }
    }
    myJsonFrame += "]}";
    res.send(JSON.parse(myJsonFrame));
}
exports.getAll = async (req, res, next) => {
    var retVal = [];
    var myJsonFrame= "{\"Tags\":[";
    for(var i = 0; i<=10;i++) //10 est max tag
    {
        retVal[i] = await method.queryTag(i,'2018-05-22T23:30:00Z',true);
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
    res.send(JSON.parse(myJsonFrame));
};

exports.updatePositions = async (req, res, next) => {
    //Regarde si les beacons sont dans la même pièce si oui ==> eligible au calcul
    console.log(req.body);
    if(req.body.BeaconDetected.length == 2)
    {
        var b0 = await method.queryBeacon(req.body.BeaconDetected[0].id,'2018-05-22T23:30:00Z',true);
        var b1 = await method.queryBeacon(req.body.BeaconDetected[1].id,'2018-05-22T23:30:00Z',true);
        if(b0[1][2] == b0[1][2])
        {
            var newPos = method.algorithmPosition(req.body.BeaconDetected[0].dist,req.body.BeaconDetected[1].dist,b0[1][0],b0[1][1],b1[1][0],b1[1][1]);
            console.table(newPos);
            method.writeTagPosition(req.body.tagId,newPos[0],newPos[1],b0[1][2]);
        }
    }
    res.status(200).json({
        status: "success"
    });
};




