#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var apiRouter = express.Router();

apiRouter.get("/", function(req, res) {
  res.json({ message: "Long live the stoke list!" });
});

app.use("/api", apiRouter);

var port = process.env.PORT;

app.listen(port);

console.log(
  "HTTP server up and listening on port " +
  port +
  " ( Likely http://localhost:" +
  port +
  " )"
);
