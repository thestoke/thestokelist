/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var Vote = require('../models/vote')
var Token = require('../models/token');
var auth = require('../lib/auth');
var validID = require('../lib/validID');

router.route("/posts")
  .get(function(req, resp) {
    Post.findRecentlyVerified(function(err, posts){
      var data = {};
      if (err) {
        // Into an array to match with how validation will happen on other routes
        data.errors = [err];
      }
      data.posts = posts;
      resp.json(data);
    });
  })
  .post(function(req, resp) {
    var body = req.body;
    var post = new Post({title: body.title, price: body.price, location: body.location, body: body.body, email: body.email});
    post.save(function(errors, post){
      if (errors){
        var data = {errors : errors};
        resp.json(data);
        return;
      }
      Token.create({'post_id' : post.id, 'email' : post.email}, function(errors, token) {
        var data = {};
        if (errors){
          data.errors = errors;
        }
        data.post = post;
        resp.json(data);
      })

    });
  });

  router.route("/posts/:id")
    .get(validID, function(req, resp) {
      Post.findById(req.params.id, function(errors,post) {
        var data = {};
        if (errors){
          data.errors = errors;
        }
        data.post = post;
        resp.json(data);
      });
    })
    .put(validID, auth, function (req, resp) {
      var post = Post.findById(req.params.id, function(err,post) {
        if (err) {
          var data = {errors: err}
          resp.json(err);
          return;
        }
        if (post.email == req.session.email || req.session.admin) {
          var body = req.body;
          post.update({title: body.title, price: body.price, location: body.location, body: body.body});
          post.save(function(errors, post){
            var data = {};
            if (errors){
              data.errors = errors;
            }
            data.post = post;
            resp.json(data);
          });
        } else {
          resp.status(403);
          return;
        }
      });
    })
    .delete(validID, auth, function (req, resp) {
      Post.findById(req.params.id, function(err,post) {
        if (err) {
          var data = {errors: errors};
          resp.json(data);
          return;
        }
        if (post.email == req.session.email || req.session.admin) {
          post.delete(function(errors){
            var data = {};
            if (errors){
              data.errors = errors;
            }
            resp.json(data);
          });
        } else {
          resp.status(403);
          return;
        }
      });
    });

  router.route("/posts/:id/votes")
    .get(validID, function(req, resp) {
      Vote.findByPostId(req.params.id, function(errors,votes) {
        var data = {};
        if (errors){
          data.errors = errors;
        }
        data.votes = votes;
        resp.json(data);
      });
    });

module.exports = router;
