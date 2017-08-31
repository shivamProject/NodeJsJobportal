// module.exports = {
// 	url : 'mongodb://localhost/expauth',
// }


var mysql = require('mysql');

var connection = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'root'
});

connection.query('use exp-auth');
