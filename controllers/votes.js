/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var router = express.Router();
var Vote = require('../models/vote');

router.route("/votes")
  .post(function(req, resp) {
    //TODO: Make this 'checking for session' stuff middleware
    var session_token = req.session.token;
    if (typeof req.session.email !== 'string') {
      resp.status(403);
      resp.send("You're not logged in");
    } else {
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
    }
  });

module.exports = router;
