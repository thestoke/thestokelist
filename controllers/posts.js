/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var router = express.Router();
var Post = require('../models/post');

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
    // TODO: Collect attributes, auth'd email or email from request
    // TODO:
  });

module.exports = router;
