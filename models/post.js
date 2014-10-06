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
  'guid',
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
  // this.createdAt = new Date();
  // this.updatedAt = new Date();
  this.sticky = false;

  if (params){
    for (var i in columns){
      var attr = columns[i];
      this[attr] = params[attr];
    }
  }

  this.save = function(cb){
    var values = {};

    for (var i in columns){
      var attr = columns[i];
      values[attr] = this[attr];
    }

    var sql = null;

    // We strip ID here if it's not a number (aka not assigned by the db)
    if (typeof this.id !== 'number'){
      delete values['id'];
      var sql = post.insert(values).toQuery();
    }
    else{
      var sql = post.update(values).where(post.id.equals(values['id'])).toQuery();
    }

    //TODO assign the newly-created id to `this` if it's a create
    var t = this;
    db.query(sql.text, sql.values, function (err, res) {
      if (err) {
        console.log("ERROR IN SAVE:");
        console.log(err);
      } else {
        console.log(res)
        if (typeof t.id !== 'number'){
          t.id = res.lastInsertId;
        }
      }
      cb(t);
    });
  }
}

Post.update = function(id, params, cb){
  Post.findById(id, function(err,res) {
    //todo: Is there a better way to grab the first result?
    var post = new Post(res.rows[0]);
    for (var i in params){
      if (columns.indexOf(i) != -1) {
        post[i] = params[i];
      }
    }
    post.save(cb);
  });
}

Post.create = function(params, cb){
  var post = new Post(params);
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

  db.query(query.toQuery().text, function(err, res){
    if (err){
      // TODO: real logging
      console.log(err);
    }
    var posts = [];
    for (var x in res.rows){
      var post = new Post(res.rows[x]);
      posts.push(post);
    }
    cb(err, posts);
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

  db.query(sql.text, sql.values, function(err, res){
    if (err){
      // TODO: real logging
      console.log(err);
    }
    var posts = [];
    for (var x in res.rows){
      var post = new Post(res.rows[x]);
      posts.push(post);
    }
    cb(err, posts);
  });
}

Post.findById = function(id, cb) {
  var sql = post
    .select(post.star())
    .from(post)
    .where(
      post.id.equals(id)
    ).toQuery();
  db.query(sql.text, sql.values, function(err, res) {
    if (err){
      // TODO: real logging
      console.log(err);
    }
    cb(err, res);
  });
}

Post.delete = function(id, cb) {
  var sql = post
    .delete()
    .from(post)
    .where(
      post.id.equals(id)
    ).toQuery();
  db.query(sql.text, sql.values, function(err, res) {
    if (err){
      // TODO: real logging
      console.log(err);
    }
    cb(err, res);
  });
}


module.exports = Post;
