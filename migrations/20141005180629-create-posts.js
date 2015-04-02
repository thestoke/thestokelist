/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable(
    'posts', {
      id: {
        type: 'int',
        primaryKey: true
      },
      title:    'string',
      price:    'string',
      location: 'string',
      body:     'string', // This used to be description
      email:    'string',
      sticky: {
        type: 'boolean',
        defaultValue: false
      },
      emailVerified: {
        type: 'boolean',
        defaultValue: false
      },
      deletedAt: {
        type: 'datetime',
        defaultValue: 'current_timestamp'
      },
      createdAt: {
        type: 'datetime',
        defaultValue: 'current_timestamp'
      },
      updatedAt: {
        type: 'datetime',
        defaultValue: 'current_timestamp'
      }
    },
    callback
  );
};

exports.down = function (db, callback) {
  db.dropTable('posts', callback);
};
