module.exports = async (err, req, res, next) => {
    res.status(500).send({ error: err });
}