/*
    Ce fichier a pour but de gérer les requêtes reçues concernant les tags
 */
const AppError = require("../utils/appError");
const method = require("./function");
require("./function");
var arraySort = require('array-sort');
/*
    Cette méthode permet de gérer la requête concernant l'historique d'un ou de plusieurs tags
    Elle n'est pas implémenté du au manque de temps, elle envoie simplement un réponse "test" qui va permettre de tester l'affichage
 */
exports.getHistory = async (req,res,next) =>{
    var myJsonFrame = "{\"TagHistory\": [{\"tag1\": [{\"id\":0,\"posX\":10,\"posY\":8,\"room\":0},{\"id\":0,\"posX\":7,\"posY\":5,\"room\":0}], \"tag2\": [{\"id\":1,\"posX\":4,\"posY\":4,\"room\":0},{\"id\":1,\"posX\":2,\"posY\":1,\"room\":0}]}]}"
    res.send(JSON.parse(myJsonFrame));
}
/*
    Cette méthode permet de gérer la requête concernant le liveTracking.
    Elle va demander à la database la dernière position depuis un certain temps (method.queryTag()) et va ensuite récupérer ces informations
    avant de les mettre en format JSON pour envoyer la réponse au webClient
 */
exports.liveTracking = async(req,res,next)=>{
    var retVal = [];
    var myJsonFrame= "{\"Tags\":[";
    for(var i = 0; i<req.query.tags.length;i++) //10 est max tag
    {
        //Requête à la base de donnée + récupération de la valeur
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
    //Envoie de la réponse
    res.send(JSON.parse(myJsonFrame));
}
/*
    Méthode visant à récupérer tous les tags existants dans la database et à les envoyer en réponse.
 */
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
/*
    Méthode servant à mettre à jour une position d'un tag dans la database
 */
exports.updatePositions = async (req, res, next) => {
    var startCalc = false;
    var temp = [];
    for(var i = 0; i < req.body.BeaconDetected.length;i++)
    {
        temp[i] = req.body.BeaconDetected[i];   //Stockage de sinformations reçues
    }
    if(req.body.BeaconDetected.length == 3) //Si 3 beacon ont été détecté
    {
        /*
            Le code qui suit (ligne 81-90) est la correction d'un problème HardWare en vu de la démonstration
            Il s'agit donc d'un cas particulier propre à notre installation.
         */
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
    else if(req.body.BeaconDetected.length == 2){startCalc = true;}//Si 2 beacon ont été détecté
    if(startCalc == true)//Démarrage de l'algorithme
    {
        var b0 = await method.queryBeacon(temp[0].id,'2018-05-22T23:30:00Z',true);
        var b1 = await method.queryBeacon(temp[1].id,'2018-05-22T23:30:00Z',true);
        if(b0[1][2] == b0[1][2]) //Les deux beacons sont dans la même salle?
        {
            //Calcul de la nouvelle position et stockage de l'information dans la database
            var newPos = method.algorithmPosition(temp[0].dist,temp[1].dist,b0[1][0],b0[1][1],b1[1][0],b1[1][1]);
            console.table(newPos);
            if (newPos)
            {
                method.writeTagPosition(req.body.tagId,newPos[0],newPos[1],b0[1][2]);
                res.status(200).json({
                    status: "success"
                });
            }
            //next(new Error("no intersection"));
        }
        //next(new Error("not in the same room"));
    }
    //next(new Error("not 2 beacon"));

};




