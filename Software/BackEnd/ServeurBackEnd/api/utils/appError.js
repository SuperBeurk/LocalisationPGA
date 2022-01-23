/*
    Classe permettant de retourner des erreurs comme réponse aux requetes http.
 */
module.exports = async (err, req, res, next) => {
    res.status(500).send({ error: err });
}