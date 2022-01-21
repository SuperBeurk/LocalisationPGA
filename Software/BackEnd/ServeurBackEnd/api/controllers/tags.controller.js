const AppError = require("../utils/appError");
const method = require("./function");
const db = require("../database");
const {Point} = require("@influxdata/influxdb-client");
const {myOrg, myClient} = require("../database");
const {reject} = require("delay");
require("./function");
const {writeBeaconPosition, queryBeacon} = require("./function");
var arraySort = require('array-sort');

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
    var startCalc = false;
    var temp = [];
    for(var i = 0; i < req.body.BeaconDetected.length;i++)
    {
        temp[i] = req.body.BeaconDetected[i];
    }
    if(req.body.BeaconDetected.length == 3)
    {
       //Sort ascending
        temp = arraySort(temp,'id');
        if(temp[0].id%2 == 1)//Impair
        {
            var temp2 = temp[0];
            temp[0] = temp[2];
            temp[2] = temp2;
        }
        startCalc = true;
    }
    else if(req.body.BeaconDetected.length == 2){startCalc = true;}
    if(startCalc == true)
    {
        var b0 = await method.queryBeacon(temp[0].id,'2018-05-22T23:30:00Z',true);
        var b1 = await method.queryBeacon(temp[1].id,'2018-05-22T23:30:00Z',true);
        if(b0[1][2] == b0[1][2])
        {
            var newPos = method.algorithmPosition(temp[0].dist,temp[1].dist,b0[1][0],b0[1][1],b1[1][0],b1[1][1]);
            console.table(newPos);
            method.writeTagPosition(req.body.tagId,newPos[0],newPos[1],b0[1][2]);
        }
    }
    res.status(200).json({
        status: "success"
    });
};




