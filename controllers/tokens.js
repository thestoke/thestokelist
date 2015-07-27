 /* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var router = express.Router();
var Post = require('../models/post');
var Token = require('../models/token');
var helper = require ('../lib/controllerHelper');

   router.route("/tokens")
      .post(function(req, resp) {
         Token.create({'email' : req.body.email}, function(errors, token) {
            helper.checkForErrors(errors,null,null,resp);
            resp.json({});
         })
      })
      .delete(function(req,resp) {
         req.session.destroy(function(errors) {
            helper.checkForErrors(errors,null,null,resp);
            resp.json({});
         })
      });


   router.route("/tokens/:value")
      .put(function(req, resp) {
         req.checkParams('value','Invalid token value').isUUID();
         var errors = req.validationErrors();
         if (helper.checkForErrors(errors,null,null,resp)) {
            return;
         }
         Token.findByValue(req.params.value, function(errors,token) {
            if (helper.checkForErrors(errors,null,null,resp)) {
               return;
            }
            if (token.post_id !== null) {
               Post.findById(token.post_id, function(errors,post) {
                  if (helper.checkForErrors(errors,null,null,resp)) {
                     return;
                  }
                  post.verify()
                  post.save(function(errors,post) {
                     setSession(req.session,token.email)
                     helper.checkForErrors(errors,'post',post,resp)
                  })
               });
            } else {
               setSession(req.session,token.email)
               resp.json({});
            }
         })
      });

 function setSession(session,email) {
   session.email = email;
   var adminEmails = process.env.ADMIN_EMAILS.split(',');
   if (adminEmails) {
      for (var i = 0; i < adminEmails; i++) {
          if (adminEmails[i] == email) {
            session.admin == true;
            break;
          };

      }
   }
 }

module.exports = router;
