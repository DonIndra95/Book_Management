const express = require("express");
const bodyParser = require("body-parser");
const route = require("./routes/route");
const mongoose = require("mongoose");
const multer = require("multer")
const app = express();

app.use(bodyParser.json());
app.use(multer().any())

mongoose
  .connect(
    "mongodb+srv://IndrashishRoy:windows10@radon-cohort-cluster.gtmdsvp.mongodb.net/group26Database?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
