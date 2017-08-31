/**
 * Created by Devendra on 18-Mar-17.
 */
var mysql = require('mysql');

var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root'
});

//connection.query('use auth');
connection.query('use authapi');

module.exports = {
    urlauth: function(userid,callback) {
        var a='';
        connection.query("select * from urlauth where userid = '"+userid+"' and isactive=1", function(err, rows){

            var dev=rows;
            var result = dev.filter(function (chain) {
                return chain.url === "/profile";
            })[0];
            var urlsdb=JSON.stringify(result);
           /* if(urlsdb.url==='/profile'){
                console.log('The profiles......to Sign up----------')
                //res.redirectTo('/signup');
            }*/
            console.log("the url in dbquerymodule json-->-"+urlsdb);
           /* console.log("the json-->-"+JSON.stringify(rows));
            console.log("the json-"+JSON.stringify(dev));*/
            //console.log('the user url is --->'+rows[0]);
            a=urlsdb;
            //return res.rows;
         /*  res.send(rows);
            return;*/
            callback(urlsdb);
        });
//return a.toString();
    },

    getulrdata: function(userid) {
        return "Hi i am Devendra kumar !";
    }
};