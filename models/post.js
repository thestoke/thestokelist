/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var db = require('../lib/db');
var sql = require('sql');

var columns = [
  'id',
  'title',
  'price',
  'location',
  'body',
  'email',
  'sticky',
  'emailVerified',
  'deletedAt',
  'createdAt',
  'updatedAt'
];

var post = sql.define({
  name: 'posts',
  columns: columns,
});

function Post(params){
  if (params){
    for (var i in columns){
      var attr = columns[i];
      this[attr] = params[attr];
    }
  }

  if (this.sticky !== true) {
      this.sticky = false;
  }

  this.validate = function(){
  }

  this.verify = function() {
    if (typeof this['emailVerified'] !== 'number') {
      this['emailVerified'] = Date.now();
    }
  }

  this.initialize = function() {
      this.createdAt = Date.now();
      this.updatedAt = this.createdAt;
      this.id = null;
  }

  this.update = function(params) {
    for (var i in params){
      if (columns.indexOf(i) !== -1) {
        this[i] = params[i];
      }
    }
  }

  this.save = function(cb){
    var values = {};
    var update = true;

    //If ID is null, or anything not assigned by the database, set up record creation
    if (typeof this.id !== 'number'){
      update = false;
    } else {
      this.updatedAt = Date.now();
    }

    for (var i in columns){
      var attr = columns[i];
      values[attr] = this[attr];
    }

    var sql = null;

    // We strip ID here if it's not a number (aka not assigned by the db)
    if (update){
      var sql = post.update(values).where(post.id.equals(values['id'])).toQuery();
    }
    else{
      var sql = post.insert(values).toQuery();
    }

    // TODO: Validate model
    var t = this;

    db.query(sql.text, sql.values, function (errors, res) {
      if (errors) {
        console.log("ERROR IN SAVE:");
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
  this.delete = function(cb){
    var sql = post
    .delete()
    .from(post)
    .where(
      post.id.equals(id)
    ).toQuery();
    db.query(sql.text, sql.values, function(errors, res) {
      if (errors){
      // TODO: real logging
        console.log(errors);
      }
      if (typeof cb === 'function'){
        cb(errors, res);
      }
    });
  }
}

Post.attributes = columns;

Post.create = function(params, cb){
  var post = new Post(params);
  post.initialize();
  post.save(cb);
};

Post.findRecent = function(includeUnverified, cb){
  var query = post
    .select(post.star())
    .from(post);

  if (!includeUnverified){
    query.where(post.emailVerified.isNotNull());
  }

  query.order(post.createdAt);

  db.query(query.toQuery().text, function(errors, res){
    if (errors){
      // TODO: real logging
      console.log(errors);
    }
    var posts = [];
    for (var x in res.rows){
      var post = new Post(res.rows[x]);
      posts.push(post);
    }
    if (typeof cb === 'function'){
      cb(errors, posts);
    }
  });
};

Post.findRecentlyVerified = function(cb){
  Post.findRecent(false, cb);
};

Post.findByEmail = function(email, cb){
  var sql = post
    .select(post.star())
    .from(post)
    .where(
      post.email.equals(email)
    )
    .order(post.createdAt).toQuery();

  db.query(sql.text, sql.values, function(errors, res){
    if (errors){
      // TODO: real logging
      console.log(errors);
    }
    var posts = [];
    for (var x in res.rows){
      var post = new Post(res.rows[x]);
      posts.push(post);
    }
    if (typeof cb === 'function'){
      cb(errors, posts);
    }
  });
}

Post.findById = function(id, cb) {
  var sql = post
    .select(post.star())
    .from(post)
    .where(
      post.id.equals(id)
    ).toQuery();
  db.query(sql.text, sql.values, function(errors, res) {
    if (errors){
      // TODO: real logging
      console.log(errors);
    }
    if (typeof cb === 'function'){
      var post = new Post(res.rows[0]);
      cb(errors, post);
    }
  });
}

Post.findByGuid = function(guid, cb) {
  var sql = post
    .select(post.star())
    .from(post)
    .where(
      post.guid.equals(guid)
    ).toQuery();
  db.query(sql.text, sql.values, function(errors, res) {
    if (errors){
      // TODO: real logging
      console.log(errors);
    }
    if (typeof cb === 'function'){
      var post = new Post(res.rows[0])
      cb(errors, post);
    }
  });
}

module.exports = Post;
