/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var db = require('../lib/db');
var sql = require('sql');
var uuid = require("node-uuid");

var columns = [
  'id',
  'email',
  'token',
  'createdAt'
];

var session = sql.define({
  name: 'sessions',
  columns: columns,
});

function Session(email){
   this.email = email;

  this.initialize = function() {
      this.createdAt = Date.now();
      this.token = uuid.v4();
      this.id = null;
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

    // We strip ID here if it's not a number (aka not assigned by the db)
    if (update){
      var sql = session.update(values).where(session.id.equals(values['id'])).toQuery();
    }
    else{
      var sql = session.insert(values).toQuery();
    }

    // TODO: Validate model
    var t = this;

    db.query(sql.text, sql.values, function (errors, res) {
      if (errors) {
        console.log("Error in Session save:");
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

Session.attributes = columns;

Session.create = function(email, cb){
  var session = new Session(email);
  session.save(cb);
};

Session.findByEmail = function(email, cb){
  var sql = session
    .select(session.star())
    .from(session)
    .where(
      session.email.equals(email)
    )
    .order(post.createdAt).toQuery();

  db.query(sql.text, sql.values, function(errors, res){
    if (errors){
      // TODO: real logging
      console.log(errors);
    }
    if (typeof cb === 'function'){
      var session = new Session(res.rows[0])
      cb(errors, session);
    }
  });
}

Session.findByToken = function(token, cb) {
  var sql = session
    .select(session.star())
    .from(session)
    .where(
      session.token.equals(tplem)
    ).toQuery();
  db.query(sql.text, sql.values, function(errors, res) {
    if (errors){
      // TODO: real logging
      console.log(errors);
    }
    if (typeof cb === 'function'){
      var session = new Session(res.rows[0])
      cb(errors, session);
    }
  });
}

module.exports = Session;
