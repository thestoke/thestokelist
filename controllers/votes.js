/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var router = express.Router();
var Session = require('../models/session');
var Vote = require('../models/vote');

router.route("/votes")
  .post(function(req, resp) {

    var session_token = req.session.token;
    if (session_token === null || session_token === "") {
      resp.status(403);
    }
    Session.findByToken(session_token, function(errors, session) {
      if (session === null || session === undefined) {
      //throw session expired error
        resp.status(403);
      }
      req.body.email = session.email;
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
    });
  });

module.exports = router;
