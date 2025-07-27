const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index'); // renderiza views/index.hbs
});

module.exports = router;
