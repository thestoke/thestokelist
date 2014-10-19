var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
   db.createTable(
    'sessions', {
      id: {
        type: 'int',
        primaryKey: true
      },
      email:    'string',
      token:    'string',
      createdAt: {
        type: 'datetime',
        defaultValue: 'current_timestamp'
      }
    },
    callback
  );
};

exports.down = function(db, callback) {
  db.dropTable('sessions', callback);
};
