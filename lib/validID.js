function validID(req, res, next) {

      req.checkParams('id', 'Invalid id').isInt();
      var errors = req.validationErrors();
      if (errors) {
        var data = {errors: errors};
        res.status(400);
        res.json(data);
        return;
      } else {
         next()
      }
}

module.exports = validID;
