var dbm = require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
   db.createTable(
    'tokens', {
      id: {
        type: 'int',
        primaryKey: true
      },
      value:    'string',
      email:    'string',
      post_id:    'int',
      createdAt: 'datetime'
    },
    callback
  );

};

exports.down = function(db, callback) {
     db.dropTable('tokens', callback);
};
