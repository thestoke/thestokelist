/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var db = require('../lib/db');
var sql = require('sql');
var uuid = require("node-uuid");
var validator = require('validator');

var columns = [
  'id',
  'post_id',
  'email',
  'like',
  'createdAt'
];

var vote = sql.define({
  name: 'votes',
  columns: columns,
});

function Vote(params){
   if (params){
    for (var i in columns){
      var attr = columns[i];
      this[attr] = params[attr];
    }
  }

  this.initialize = function() {
      this.id = null;
      this.createdAt = Date.now();
  }

  this.validate = function(){
    var errors = [];
    if (!validator.isEmail(this.email)) {
      errors.push("Invalid or empty email address");
    }
    if (!validator.isInt(this.post_id)) {
      errors.push("post_id must be an integer")
    }
    if (!validator.isLength(this.like,1)) {
      errors.push("like is a required field")
    }
    this.like = validator.toBoolean(this.like,true);
    return errors;
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
    if (update){
      var sql = vote.update(values).where(vote.id.equals(values['id'])).toQuery();
    }
    else{
      var sql = vote.insert(values).toQuery();
    }

    // TODO: Validate model
    var t = this;

    db.query(sql.text, sql.values, function (errors, res) {
      if (errors) {
        console.log("Error in Vote save:");
        console.log(errors);
      } else {
        if (!update) {
          t.id = res.lastInsertId;
        }
      }
      if (typeof cb === 'function'){
        cb(errors, t);
      }
    });
  }
}

Vote.attributes = columns;

Vote.create = function(email, cb){
  var vote = new Vote(email);
  vote.initialize();
  vote.save(cb);
};

Vote.findByEmail = function(email, cb){
  var sql = vote
    .select(vote.star())
    .from(vote)
    .where(
      vote.email.equals(email)
    )
    .order(vote.createdAt).toQuery();

  db.query(sql.text, sql.values, function(errors, res){
   if (errors){
      // TODO: real logging
      console.log(errors);
   }
    if (typeof cb === 'function'){
      var votes = [];
      for (var x in res.rows){
        var vote = new Vote(res.rows[x]);
        votes.push(vote);
      }
      cb(errors, votes);
    }
  });
}

Vote.findById = function(id, cb){
  var sql = vote
    .select(vote.star())
    .from(vote)
    .where(
      vote.id.equals(id)
    ).toQuery();

  db.query(sql.text, sql.values, function(errors, res){
    if (errors){
      // TODO: real logging
      console.log(errors);
    }
    if (typeof cb === 'function'){
      var vote = new Vote(res.rows[0])
      cb(errors, vote);
    }
  });
}

Vote.findByPostId = function(post_id, cb){
  var sql = vote
    .select(vote.star())
    .from(vote)
    .where(
      vote.post_id.equals(post_id)
    ).toQuery();

  db.query(sql.text, sql.values, function(errors, res){
    if (errors){
      // TODO: real logging
      console.log(errors);
    }
    if (typeof cb === 'function'){
      var votes = [];
      for (var x in res.rows){
        var vote = new Vote(res.rows[x]);
        votes.push(vote);
      }
      cb(errors, votes);
    }
  });
}

module.exports = Vote;
