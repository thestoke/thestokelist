var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
   db.createTable(
    'votes', {
      id: {
        type: 'int',
        primaryKey: true
      },
      post_id:    'int',
      email:    'string',
      like: 'boolean',
      createdAt: {
        type: 'datetime',
        defaultValue: 'current_timestamp'
      }
    },
    callback
  );
};

exports.down = function(db, callback) {
  db.dropTable('votes', callback);
};
