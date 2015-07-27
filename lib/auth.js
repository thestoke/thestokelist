function auth(req, res, next) {
   if (req.session) {
       var session_token = req.session.token;
       if (typeof req.session.email !== 'string') {
         res.status(403);
         next("You are not logged in");
       } else {
         next();
      }
   } else {
      resp.status(403);
      next("You must be logged in to access this resource");
   }
}

module.exports = auth;
