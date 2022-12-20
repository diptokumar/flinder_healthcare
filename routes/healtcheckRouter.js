const express = require('express');

const router = express.Router();

router.get('/healthz', (req, res) => {
  try {
    const data = {
      uptime: process.uptime(),
      message: 'Ok',
      date: new Date()
    };
    res.status(200).send(data);
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;