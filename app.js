require('dotenv').config()
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var getUpdateRouter = require('./routes/getUpdate');

var app = express();
var port = process.env.PORT || 8050;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/getUpdate', getUpdateRouter);

app.use((req, res, next) => {
    res.sendStatus(404);
})

app.listen(port, function(){
    console.log('Server is running at port: ',port);
});
module.exports = app;