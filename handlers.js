function notFoundHandler(req, res) {
    res.status(404).send('page not found 404')
}
function errorHandler(err, req, res) {
    res.status(500).send(err)
}
module.exports={
    notFoundHandler:notFoundHandler,
    errorHandler:errorHandler  
}