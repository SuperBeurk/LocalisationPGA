const db = require("../database");
const {Point} = require("@influxdata/influxdb-client");
//Toutes les méthode que notre api va utiliser

module.exports = {
    /*
        queryTag met en forme une requête pour la database afin d'obtenir la position d'un tag en fonction de certains paramètres. .
        Elle permet de choisir le tag qui nous interesse, un filtre de temps ainsi que la possibilite de prendre uniquement la dernière position existante
        Params: beacon_id (nom du beacon), timeFilter (le temps sur laquelle on applique la query), onlyLast (seulement dernire position?)
     */
    queryTag: (tag_Id,timeFilter,onlyLast) => {
        var last='';
        if(onlyLast == true)
        {
            last='|>last()';
        }
        //First Beacon of room check tag
        var arr = []
        var b = [];
        var c = [];
        var myTag= "tag" + tag_Id;
        //query
        var query = 'from(bucket: \"' + db.myBucket + '\") |> range(start:' + timeFilter + ')|> filter(fn:(r)=>r.TAG==\"' + myTag + '\"and r._measurement =="Position")'+last;
        var queryApi = db.myClient.getQueryApi(db.myOrg);
        return new Promise((resolve, reject) => {
            Promise.all([
                queryApi.collectRows(query) //query par collonne
            ]).then(data => {//success
                //Récupération de sinformations et mise en forme
                for (var i = 0; i < data[0].length; i++) {
                    c[i] = data[0][i]._value
                }
                arr[1] = c
                resolve(arr);
            }).catch(error => {//error
                console.error(error)
                console.log('\nCollect ROWS ERROR')
                reject(error);
            })
        });
    },
    /*
        Méthode qui doit récupérer l'historique d'un tag sur un certain temps /!\ NE FONCTIONNE ACTUELLEMENT PAS
     */
    queryTagHistory: (tag_Id,timeFilter,nSampling) => {
        //First Beacon of room check tag
        var frequency = "30s"
        var arr = []
        var b = [];
        var c = [];
        var myTag= "tag" + tag_Id;
        var query = 'from(bucket: \"' + db.myBucket + '\") |> range(start:' + timeFilter + ')|> filter(fn:(r)=>r.TAG==\"' + myTag + '\"and r._measurement =="Position")|>sample(n:'+ nSampling+')';
        var queryApi = db.myClient.getQueryApi(db.myOrg);
        //First query
        return new Promise((resolve, reject) => {
            Promise.all([
                queryApi.collectRows(query)
            ]).then(data => {
                console.log(data)
                for (var i = 0; i < data[0].length; i++) {
                    c[i] = data[0][i]._value
                }
                arr[1] = c
                resolve(arr);
            }).catch(error => {
                console.error(error)
                console.log('\nCollect ROWS ERROR')
                reject(error);
            })
        });
    },
    /*
        queryBeacon met en forme une requête pour la database afin d'obtenir la position d'un beacon en fonction de certains paramètres. .
        Elle permet de choisir le tag qui nous interesse, un filtre de temps ainsi que la possibilite de prendre uniquement la dernière position existante.
        Params: beacon_id (nom du beacon), timeFilter (le temps sur laquelle on applique la query), onlyLast (seulement dernire position?)
     */
    queryBeacon: (beacon_Id,timeFilter,onlyLast) => {
        //First Beacon of room check tag
        var last='';
        if(onlyLast == true)
        {
            last='|>last()';
        }
        var arr = []
        var b = [];
        var c = [];
        var myBeacon= "beacon" + beacon_Id;
        var query = 'from(bucket: \"' + db.myBucket + '\") |> range(start:' + timeFilter + ')|> filter(fn:(r)=>r.Beacon==\"' + myBeacon + '\"and r._measurement =="Position")'+last;
        var queryApi = db.myClient.getQueryApi(db.myOrg);
        //First query
        return new Promise((resolve, reject) => {
            Promise.all([
                queryApi.collectRows(query)
            ]).then(data => {
                //console.log('\nRead success')
                for (var i = 0; i < data[0].length; i++) {
                    c[i] = data[0][i]._value
                }
                arr[1] = c
                resolve(arr);
            }).catch(error => {
                console.error(error)
                console.log('\nCollect ROWS ERROR')
                reject(error);
            })
        });
    },
    /*
         writeBeaconPosition met en forme une requête pour la database afin d'écrire la position d'un beacon.
         //Params : room dans laquelle se trouve le tag, posX,posY, beaconID (numéro d'un beacon)
    */
    writeBeaconPosition: (beaconId,posX,posY,roomId) => {
        var myBeacon = "beacon" + beaconId;

        var point = new Point('Position').tag("Beacon", myBeacon)
            .floatField('position_x', posX).floatField('position_y', posY).floatField('room', roomId);
        var writeApi = db.myClient.getWriteApi(db.myOrg, db.myBucket);
        writeApi.writePoint(point)
        return new Promise(((resolve, reject) => {
            writeApi.close()
                .then(() => {
                    resolve({status: "Success"});
                })
                .catch(e => {
                    reject(e);
                })
        }))
    },
    //writeTagPosition met en forme une requête pour la database afin d'écrire la position d'un tag.
    //Params : room dans laquelle se trouve le tag, posX,posY, tagID (numéro du tag)
    writeTagPosition: (tagId,posX,posY,roomId) => {
        var myTag = "tag" + tagId;
        var point = new Point('Position').tag("TAG", myTag)
            .floatField('position_x', posX).floatField('position_y', posY).floatField('room', roomId);;
        var writeApi = db.myClient.getWriteApi(db.myOrg, db.myBucket);
        writeApi.writePoint(point)
        return new Promise(((resolve, reject) => {
            writeApi.close()
                .then(() => {
                    resolve({status: "Success"});
                })
                .catch(e => {
                    reject(e);
                })
        }))
    },
    /*
        méthode permettan la localisation d'un tag en fonction de deux beacons
        Params: distance au premier beacon, distance au deuxieme beacon, points du premier beacon, points du deuxieme beacon
     */
    algorithmPosition:(r0,r1,x0,y0,x1,y1)=>{
        var distTwoCircle = Math.sqrt(Math.pow(x1-x0,2) +Math.pow(y1-y0,2)  )
        var radSum=r1+r0;
        var retValue = [];
        //On regarde si on arrive à déterminer une localisation ou non
        if((distTwoCircle-radSum)>0)
        {
            return null; //return
        }
        else
        {
            //Début du calcul
            var a=(Math.pow(r0,2)-Math.pow(r1,2)+Math.pow(distTwoCircle,2))/(2*distTwoCircle);
            var h=Math.sqrt(Math.pow(r0,2)-Math.pow(a,2));
            var x2=x0+(x1-x0)*(a/distTwoCircle);
            var y2=y0+(y1-y0)*(a/distTwoCircle);
            y3=y2-(h*(x1-x0))/distTwoCircle;
            //On ne garde que la valeur positive en y
            if(y3<0)
            {
                y4 = (y2 + (h * (x1 - x0)) / distTwoCircle);
                x4 = (x2 - (h * (y1 - y0)) / distTwoCircle);
                retValue[0] = parseFloat(x4);
                retValue[1] = parseFloat(y4);
                return retValue;
            }
            else
            {
                x3=x2+(h*(y1-y0))/distTwoCircle;
                retValue[0] = parseFloat(x3);
                retValue[1] = parseFloat(y3);
                return retValue;
            }
        }
    },
    meanTagDetectedDistance: (beaconMessageHistory,tagId) => {
        var mean = 0;
        var n = 0;
        for(var i = 0 ; i< beaconMessageHistory[0].length;i++)
        {
            if(beaconMessageHistory[0][i] == tagId)
            {
                mean += beaconMessageHistory[1][i];
                n++;
            }
        }
        mean=mean/n;
        return mean;
    }
};
