/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var express = require('express');
var router = express.Router();
var Post = require('../models/post');

router.get("/", function(req, res) {
  Post.findRecentlyVerified(function(err, posts){
    res.json(posts);
  });
});

router.get("/:id", function(req, res) {
   var id = req.params.id;
   Post.findById(id, function(err,post) {
      res.json(post);
   })
});

router.post("/", function(req, res) {
  Post.create(req.body.post, function(post) {
   res.json(post);
  });
})

router.put("/:id", function (req, res) {
   Post.update(req.params.id, req.body.post, function(post) {
      res.json(post);
   })
})

router.delete("/:id", function (req, res) {
   Post.delete(req.params.id, function(err, post) {
      //TODO: Verify deletion/check if item exists before deleting?
      res.status(204).send();
   })
})



module.exports = router;
