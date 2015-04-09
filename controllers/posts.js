/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var Vote = require('../models/vote')
var Token = require('../models/token');
var auth = require('../lib/auth');
var validID = require('../lib/validID')('id');

router.route("/posts")
  .get(function(req, resp) {
    Post.findRecentlyVerified(function(errors, posts){
      checkForErrors(errors,'posts',posts,resp)
    });
  })
  .post(function(req, resp) {
    var body = req.body;
    var post = new Post({title: body.title, price: body.price, location: body.location, body: body.body, email: body.email, ip: req.ip});
    post.save(function(errors, post){
      if (returnIfErrors(errors,resp)) {
        return;
      }
      Token.create({'post_id' : post.id, 'email' : post.email}, function(errors, token) {
        checkForErrors(errors,'post',post,resp)
      })

    });
  });

  router.route("/posts/:id")
    .get(validID, function(req, resp) {
      Post.findById(req.params.id, function(errors,post) {
        checkForEmptyRecord(post,resp);
        checkForErrors(errors,'post',post,resp);
      });
    })
    .put(validID, auth, function (req, resp) {
      var post = Post.findById(req.params.id, function(errors,post) {
        if (returnIfErrors(errors,resp)) {
          return;
        }
        if (post != null && (post.email == req.session.email || req.session.admin)) {
          var body = req.body;
          post.update({title: body.title, price: body.price, location: body.location, body: body.body});
          post.save(function(errors, post){
            checkForErrors(errors,'post',post,resp)
          });
        } else if checkForEmptyRecord(post,resp) {
          return;
        } else {
          resp.status(403);
          return;
        }
      });
    })
    .delete(validID, auth, function (req, resp) {
      Post.findById(req.params.id, function(errors,post) {
        if (returnIfErrors(errors,resp)) {
          return;
        }
        if (post != null && (post.email == req.session.email || req.session.admin)) {
          post.delete(function(errors){
            checkForErrors(errors,null,null,resp)
          });
        } else if checkForEmptyRecord(post,resp) {
          return;
        } else {
          resp.status(403);
          return;
        }
      });
    });

  router.route("/posts/:id/votes")
    .get(validID, function(req, resp) {
      Vote.findByPostId(req.params.id, function(errors,votes) {
        checkForErrors(errors,votes,resp)
      });
    });

    function checkForErrors(errors,recordName,record,resp) {
      var data = {}
      if (errors) {
        data.errors = errors;
        resp.status(400);
      }
      if (record && recordName) {
        data[recordName] = record;
      }
      resp.json(data);
    }

    function returnIfErrors(errors,resp) {
      if (errors) {
          var data = {errors: errors};
          resp.json(data);
          return true;
      } else {
        return false;
      }
    }

    function checkForEmptyRecord(record,resp) {
      if (record == null) {
        resp.status(404);
        return true
      } else {
        return false;
      }
    }

module.exports = router;
