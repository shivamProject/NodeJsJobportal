var LocalStrategy = require('passport-local').Strategy;
// var User = require('../models/user');
var mysql = require('mysql');

var connection = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'root'
});

//connection.query('use auth');
connection.query('use authapi');

module.exports = function(passport){
	passport.serializeUser(function(user, done){
		console.log('serializeUser: ' + user.email)
		done(null, user.email);
	});

	passport.deserializeUser(function(email, done){
		// User.findById(id, function(err, user){
		// 	done(err, user);
		// });
		connection.query("select * from users where email = ? ",[email], function(err, results, fields){
			done(err, results[0]);
		});

		// done(null, '12345');
	});

	passport.use('local-signup', new LocalStrategy({
		usernameField:'email',
		passwordField:'password',
		passReqToCallback: true,
	},
	function(req, email, password, done){
		// process.nextTick(function(){
		// 	User.findOne({'local.email':email},function(err, user){
		// 		if(err)
		// 			return done(err);
		// 		if(user){
		// 			return done(null, false, req.flash('signupMessage', 'That email is already is use.'));
		// 		} else {
		// 			var newUser = new User();
		// 			newUser.local.email = email;
		// 			newUser.local.password = password;//newUser.generateHash(password);
		// 			newUser.save(function(err){
		// 				if(err)
		// 					throw err;
		// 				return done(null, newUser);
		// 			});
		// 		}
		// 	});
		// });
		connection.query("select * from users where email = ? ",[email],function(err, rows){
			console.log(rows);
			if(err)
				return done(err);
			if(rows.length){
				return done(null, false, req.flash('signupMessage', 'That email is already exists.'));
			}else{
				var newUser = new Object();
				newUser.email = email;
				newUser.password = password;

				var insertQuery = "insert into users (email, password) values ('"+email+"','"+password+"')";
				console.log(insertQuery);
				connection.query(insertQuery, function(err, rows){
					console.log(rows);
					newUser.id = rows.insertId;
					return done(null, newUser);
				});
			}
		});
	}));

	passport.use('local-login', new LocalStrategy({
		usernameField:'email',
		passwordField:'password',
		passReqToCallback:true,
	},
	function(req, email, password, done){
		// User.findOne({'local.email':email},
		// 	function(err,user){
		// 		if(err)
		// 			return done(err);
		// 		if(!user)
		// 			return done(null, false, req.flash('loginMessage','No user found.'));
		// 		if(!user.validPassword(password))
		// 			return (null, false, req.flash('loginMessage','Wrong Password.'));
		// 	});
		connection.query("select * from users where email = '"+email+"'", function(err, rows){
			if(err)
				return done(err);
			if(!rows.length){
				return done(null, false, req.flash('loginMessage','No user found'));
			}
			if(!(rows[0].password == password)){
				return done(null, false, req.flash('loginMessage','Worng password'));
			}
			return done(null, rows[0]);
		});
	}));
};
