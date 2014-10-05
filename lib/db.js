/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var sql = require('sql');

var anyDB = require('any-db');

// This can be updated to be a pool if required
var conn = anyDB.createConnection(process.env.DATABASE_URL);

module.exports = conn;
