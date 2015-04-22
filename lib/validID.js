module.exports = function(param) {
   return function(req, res, next) {

      req.checkParams(param, 'Invalid id').isInt();
      var errors = req.validationErrors();
      if (errors) {
        var data = {errors: ["Invalid ID"]};
        res.status(400);
        res.json(data);
        return;
      } else {
         next()
      }
   }
};
