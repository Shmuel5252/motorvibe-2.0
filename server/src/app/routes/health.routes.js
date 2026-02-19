const router = require("express").Router();

router.get("/", (req, res) => {
  return res.status(200).json({
    status: "ok",
    service: "motovibe-api",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
