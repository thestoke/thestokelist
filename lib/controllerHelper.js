module.exports = {
    checkForErrors: function(errors,recordName,record,resp) {
      var data = {}
      if (errors) {
        data.errors = errors;
        resp.status(400);
      }
      if (record && recordName) {
        data[recordName] = record;
      }
      resp.json(data);
    },

    returnIfErrors: function(errors,resp) {
      if (errors) {
          var data = {errors: errors};
          resp.json(data);
          return true;
      } else {
        return false;
      }
    },

    checkForEmptyRecord: function(record,resp) {
      if (record == null) {
        resp.status(404);
        return true
      } else {
        return false;
      }
    }
}
