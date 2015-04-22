/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var db = require('../lib/db');
var sql = require('sql');
var uuid = require("node-uuid");
var postmark = require("postmark")(process.env.POSTMARK_KEY);
var validator = require('validator');

var columns = [
  'id',
  'value',
  'email',
  'post_id',
  'createdAt'
];

var token = sql.define({
  name: 'tokens',
  columns: columns,
});

function Token(params){
  if (params){
    for (var i in columns){
      var attr = columns[i];
      this[attr] = params[attr];
    }
  }

  this.initialize = function() {
      this.createdAt = Date.now();
      this.value = uuid.v4();
      this.id = null;
  }

  this.validate = function(){
    var errors = [];
    if (!validator.isEmail(this.email)) {
      errors.push("Invalid or empty email address");
    }
    return errors;
  }

  this.sendMail = function() {
    if (this.post_id != null) {
      postmark.send({
        "From": "list@thestoke.ca",
        "To": this.email,
        //TODO: Add post title
        "Subject": "Your Stoke List Post",
        "TextBody": "You're *almost* done!"+
                    "\n\n"+
                    "You must click the link below in order to verify your email address:"+
                    "\n\n"+
                    "http://post.thestoke.ca/login/"+this.value+
                    "\n\n"+
                    "10 minutes after that, you should see your post live."+
                    "\n\n\n"+
                    "To DELETE your post at any time, please visit this link:"+
                    "\n"+
                    "http://post.thestoke.ca/d/eeaf3201-a7dd-47a2-ab54-c0c283cebd35"+
                    "\n\n"+
                    "Thanks, The Stoke List."
      });
    } else {
      postmark.send({
      "From": "list@thestoke.ca",
      "To": this.email,
      "Subject": "Stoke List Login",
      "TextBody": "You're *almost* done!"+
                  "\n\n"+
                  "You must click the link below in order to login:"+
                  "\n\n"+
                  "http://post.thestoke.ca/login/"+this.value+
                  "\n\n"+
                  "Thanks, The Stoke List."
      });
    }
  }

  this.save = function(cb){

    var validationErrors = this.validate();
    if (validationErrors.length > 0) {
      cb(validationErrors,null);
      return;
    }

    var values = {};
    var update = true;

    //If ID is null, or anything not assigned by the database, set up record creation
    if (typeof this.id !== 'number'){
      update = false;
    }

    for (var i in columns){
      var attr = columns[i];
      values[attr] = this[attr];
    }

    var sql = null;

    // We strip ID here if it's not a number (aka not assigned by the db)
    if (update){
      var sql = token.update(values).where(token.id.equals(values['id'])).toQuery();
    }
    else{
      var sql = token.insert(values).toQuery();
    }

    // TODO: Validate model
    var t = this;

    db.query(sql.text, sql.values, function (errors, res) {
      if (errors) {
        console.log("Error in Token save:");
        console.log(errors);
      } else {
        if (typeof t.id !== 'number'){
          t.id = res.lastInsertId;
        }
      }
      if (typeof cb === 'function'){
        cb(errors, t);
      }
    });
  }
}

Token.attributes = columns;

Token.create = function(params, cb){
  var token = new Token(params);
  token.initialize();
  token.save(function(errors,token) {
    if (cb) {
      cb(errors,token);
    }
    if (!errors) {
      token.sendMail();
    }
  });
};

Token.findByEmail = function(email, cb){
  var sql = token
    .select(token.star())
    .from(token)
    .where(
      token.email.equals(email)
    )
    .order(token.createdAt).toQuery();

  db.query(sql.text, sql.values, function(errors, res){
    if (errors){
      // TODO: real logging
      console.log(errors);
    }
    if (typeof cb === 'function'){
      var tokens = [];
      for (var x in res.rows){
        var token = new Token(res.rows[x]);
        tokens.push(token);
      }
      cb(errors, tokens);
    }
  });
}

Token.findByValue = function(value, cb) {
  var sql = token
    .select(token.star())
    .from(token)
    .where(
      token.value.equals(value)
    ).toQuery();
  db.query(sql.text, sql.values, function(errors, res) {
    if (errors){
      // TODO: real logging
      console.log(errors);
    }
    if (typeof cb === 'function'){
      var token = new Token(res.rows[0])
      cb(errors, token);
    }
  });
}

Token.findById = function(id, cb) {
  var sql = token
    .select(token.star())
    .from(token)
    .where(
      token.id.equals(id)
    ).toQuery();
  db.query(sql.text, sql.values, function(errors, res) {
    if (errors){
      // TODO: real logging
      console.log(errors);
    }
    if (typeof cb === 'function'){
      var token = new Token(res.rows[0])
      cb(errors, token);
    }
  });
}

module.exports = Token;
