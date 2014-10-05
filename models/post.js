/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var db = require('../lib/db');
var sql = require('sql');


var post = sql.define({
  name: 'posts',
  columns: [
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
  ],
});

function Post(params){
  this.id = params.id;
  this.title = params.title;
  this.price = params.price;
  this.location = params.location;
  this.body = params.body;
  this.email = params.email;
  this.guid = params.guid;
  this.sticky = params.sticky;
  this.emailVerified = params.emailVerified;
  this.deletedAt = params.deletedAt;
  this.createdAt = params.createdAt;
  this.updatedAt = params.updatedA;

  this.save = function(cb){
    // var sql =
  }
}

Post.create = function(params, cb){
  var post = new Post(params);
  post.save(cb);
};

Post.findByEmail = function(nick, cb){
  var sql = post
    .select(post.star())
    .from(post)
    .where(
      post.nick.equals(nick)
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


module.exports = Post;
