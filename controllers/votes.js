/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var router = express.Router();
var Vote = require('../models/vote');
var auth = require('../lib/auth')

router.route("/votes")
  .post(auth, function(req, resp) {
    req.body.email = req.session.email;
    var vote = new Vote(req.body);
    //todo: Remove guid/uuid/other fields users shouldn't be able to specify
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
