/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var db = require('../lib/db');
var sql = require('sql');
var uuid = require("node-uuid");

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
  }

  this.save = function(cb){
    var values = {};
    var update = true;

    //If ID is null, or anything not assigned by the database, set up record creation
    if (typeof this.id !== 'number'){
      update = false;
      this.initialize();
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
        if (typeof cb === 'function'){
          cb(errors, t);
        }
      } else {
        if (!update) {
         t.id = res.lastInsertId;
         Vote.findById(res.lastInsertId, function(errors, vote) {
            t.createdAt = vote.createdAt;
            if (typeof cb === 'function'){
              cb(errors, t);
            }
         });
        } else {
        if (typeof cb === 'function'){
          cb(errors, t);
        }
        }
      }
    });
  }
}

Vote.attributes = columns;

Vote.create = function(email, cb){
  var vote = new Vote(email);
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
   var votes = [];
   for (var x in res.rows){
      var vote = new Vote(res.rows[x]);
      votes.push(vote);
    }
    if (typeof cb === 'function'){
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

module.exports = Vote;
