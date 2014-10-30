 /* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var Token = require('../models/token');

   router.route("/tokens")
      .post(function(req, resp) {
         Token.create({'email' : req.body.email}, function(errors, token) {
            var data = {};
            if (errors){
               data.errors = errors;
            }
            resp.json(data);
         })
      })
      .delete(function(req,resp) {
         req.session.destroy(function(errors) {
            var data = {};
            if (errors){
               data.errors = errors;
            }
            resp.json(data);
      });


   router.route("/tokens/:value")
      .put(function(req, resp) {
         Token.findByValue(req.params.value, function(errors,token) {
            if (token.post_id !== null) {
               Post.findById(token.post_id, function(errors,post) {
                  post.verify()
                  post.save(function(errors,post) {
                     var data = {};
                     if (errors){
                        //TODO: include all errors
                        data.errors = errors;
                     }
                     data.post = post;
                     req.session.email = token.email;
                     resp.json(data);
                  })
               });
            } else {
               var data = {};
               if (errors){
                  data.errors = errors;
               }
               data.post = post;
               req.session.email = token.email;
               resp.json(data);
            }
         })
      });

module.exports = router;
