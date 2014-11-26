/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var router = express.Router();
var Vote = require('../models/vote');
var auth = require('../lib/auth')

router.route("/votes")
  .post(auth, function(req, resp) {
    req.checkBody('post_id','Invalid post id').isInt();
    req.sanitize('like').toBoolean();
    var errors = req.validationErrors();
    if (errors) {
      var data = {errors: errors};
      resp.json(data);
      return;
    }

    var body = req.body;
    var vote = new Vote({post_id: body.post_id, like: body.like, email: req.session.email});
    vote.save(function(errors, vote){
      var data = {};
      if (errors){
        data.errors = errors;
      }
      data.vote = vote;
      resp.json(data);
    });
  })
  .get(auth, function(req, resp) {
    Vote.findByEmail(req.session.email, function(err, votes){
      var data = {};
      if (err) {
        data.errors = [err];
      }
      data.votes = votes;
      resp.json(data);
    });
  });

module.exports = router;
