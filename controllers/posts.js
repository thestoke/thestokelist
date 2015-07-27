/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var Vote = require('../models/vote');
var Token = require('../models/token');
var auth = require('../lib/auth');
var validID = require('../lib/validID')('id');
var helper = require('../lib/controllerHelper');

console.log(helper);

router.route("/posts")
  .get(function(req, resp) {
    Post.findRecentlyVerified(function(errors, posts){
      helper.checkForErrors(errors,'posts',posts,resp)
    });
  })
  .post(function(req, resp) {
    var body = req.body;
    if (body.email === undefined && req.session.email) {
      //If no e-mail supplied and logged in, use e-mail from session
      body.email = req.session.email
    }
    var post = new Post({title: body.title, price: body.price, location: body.location, body: body.body, email: body.email, ip: req.ip});
    post.save(function(errors, post){
      if (helper.checkForErrors(errors,null,null,resp)) {
        return;
      }
      Token.create({'post_id' : post.id, 'email' : post.email}, function(errors, token) {
        helper.checkForErrors(errors,'post',post,resp);
      })
    });
  });

  router.route("/posts/:id")
    .get(validID, function(req, resp) {
      Post.findById(req.params.id, function(errors,post) {
        helper.checkForEmptyRecord(post,resp);
        helper.checkForErrors(errors,'post',post,resp);
      });
    })

    .put(validID, auth, function (req, resp) {
      var post = Post.findById(req.params.id, function(errors,post) {
        if (helper.checkForErrors(errors,null,null,resp)) {
          return;
        }
        if (post != null && (post.email == req.session.email || req.session.admin)) {
          var body = req.body;
          post.update({title: body.title, price: body.price, location: body.location, body: body.body});
          post.save(function(errors, post){
            helper.checkForErrors(errors,'post',post,resp);
          });
        } else if (helper.checkForEmptyRecord(post,resp)) {
          return;
        } else {
          resp.status(403);
          return;
        }
      });
    })
    .delete(validID, auth, function (req, resp) {
      Post.findById(req.params.id, function(errors,post) {
        if (helper.checkForErrors(errors,null,null,resp)) {
          return;
        } else if (helper.checkForEmptyRecord(post,resp)) {
          return;
        } else if (post.email == req.session.email || req.session.admin) {
          post.delete(function(errors){
            helper.checkForErrors(errors,null,null,resp);
            resp.json({});
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
        helper.checkForErrors(errors,votes,resp)
      });
    });

module.exports = router;
