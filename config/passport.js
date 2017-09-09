var LocalStrategy = require('passport-local').Strategy;
var LocalFormStrategy = require('passport-local-forms').Strategy;
var forms = require('forms'),fields = forms.fields;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var fbStrategy = require('passport-facebook').Strategy;
var authConfig = require('../config/googleauth.json');
// var User = require('../models/user');
var mysql = require('mysql');

var connection = mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'root'
});

//connection.query('use auth');
connection.query('use authapi');

var loginForm = forms.create({
	username: fields.string({ required: true })
	, password: fields.password({ required: true })
});


module.exports = function(passport){
	passport.serializeUser(function(user, done){

		if(user.provider=='facebook' || user.provider=='google'){
			done(null, user);
		}else{
			done(null, user);
		}
		//console.log('serializeUser: ' + user.email);
		//console.log('serializeUser: ' + user.emails[0].value);

		//done(null, user);
	});

	passport.deserializeUser(function(user, done){
		if(user.provider=='facebook' || user.provider=='google'){
			done(null, user);
		}else{
			//done(null, user.email);
			var email1=user.email;
			connection.query("select * from users where email = ? ",[email1], function(err, results, fields){
			 done(err, results[0]);
			 });
		}
		// User.findById(id, function(err, user){
		// 	done(err, user);
		// });
		//Mysql Use
		/*connection.query("select * from users where email = ? ",[email], function(err, results, fields){
			done(err, results[0]);
		});*/

		 //done(null, email);
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

	passport.use('local-form-login',new LocalFormStrategy({
			usernameField:'userid',
			passwordField:'password',
			form: loginForm
			, formError: function(err, req, form) {
				req.res.render('login', { loginForm: form, user: req.user, message: err.message });
			}
		}
		, function(form,req, userid, password, done) {
			// asynchronous verification, for effect...
			process.nextTick(function () {

				// Find the user by username.  If there is no user with the given
				// username, or the password is not correct, set the user to `false` to
				// indicate failure and set a flash message.  Otherwise, return the
				// authenticated `user`.
				connection.query("select * from users where email = '"+userid+"'", function(err, rows){
					if(err)
						return done(err);
					if(!rows.length){
						return done(null, false, req.flash('loginMessage','No user found'));
					}
					if(!(rows[0].password == password)){
						return done(null, false, req.flash('loginMessage','Worng password'));
					}
					console.log('The usename---->'+form.data.username);
					return done(null, rows[0]);
				});
				/*findByUsername(form.data.username, function(err, user) {
					if (err) { return done(err); }
					if (!user) { return done(null, false, { message: 'Unknown user ' + form.data.username }); }
					if (user.password != form.data.password) { return done(null, false, { message: 'Invalid password' }); }
					return done(null, user);
				});*/
			});
		}
	));

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
//   See http://passportjs.org/docs/configure#verify-callback
	passport.use('googleauthStretagy',new GoogleStrategy(
		// Use the API access settings stored in ./config/auth.json. You must create
		// an OAuth 2 client ID and secret at: https://console.developers.google.com
		authConfig.google,

		function(accessToken, refreshToken, profile, done) {
			// Typically you would query the database to find the user record
			// associated with this Google profile, then pass that object to the `done`
			// callback.
			return done(null, profile);
		}
	));

	passport.use('fbauthStretagy',new fbStrategy(
		// Use the API access settings stored in ./config/auth.json. You must create
		// an OAuth 2 client ID and secret at: https://console.developers.google.com
		authConfig.facebook,

		function(accessToken, refreshToken, profile, done) {
			// Typically you would query the database to find the user record
			// associated with this Google profile, then pass that object to the `done`
			// callback.
			return done(null, profile);
		}
	));
};
