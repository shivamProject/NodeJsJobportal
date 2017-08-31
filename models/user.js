var mongoose = require('mongoose');
// var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
	local:{
		email:String,
		password:String,
	},
});

function pwdCompare(pwd, localPwd){
	if(pwd == localPwd)
		return true;
	else
		return false;
}

// userSchema.methods.generateHash = function (password) {
// 	return bcrypt.hashSync(password, bcrypt.genSalt(8),null);
// };

userSchema.methods.validPassword = function(password){
	return pwdCompare(password, this.local.password);
};

//module.exports = mongoose.model('User', userSchema);
