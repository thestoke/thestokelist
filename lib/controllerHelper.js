module.exports = {

    //If errors, return true and send response
    //If no errors, only send response if recordName/record are set
    checkForErrors: function(errors,recordName,record,resp) {
      var data = {}
      var ret = false;
      if (errors) {
        data.errors = errors;
        resp.status(400);
        resp.json(data);
        ret = true;
      }
      if (record && recordName) {
        data[recordName] = record;
        resp.json(data);
      }
      return ret;
    },

    checkForEmptyRecord: function(record,resp) {
      if (record == null) {
        resp.status(404);
        resp.json({});
        return true
      } else {
        return false;
      }
    }
}
