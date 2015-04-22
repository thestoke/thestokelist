/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var router = express.Router();
var Vote = require('../models/vote');
var auth = require('../lib/auth');
var helper = require ('../lib/controllerHelper');

router.route("/votes")
  .post(auth, function(req, resp) {
    var body = req.body;
    var vote = new Vote({post_id: body.post_id, like: body.like, email: req.session.email});
    vote.save(function(errors, vote){
      helper.checkForErrors(errors,'vote',vote,resp)
    });
  })
  .get(auth, function(req, resp) {
    Vote.findByEmail(req.session.email, function(errors, votes){
      helper.checkForErrors(errors,'votes',votes,resp)
    });
  });

module.exports = router;
