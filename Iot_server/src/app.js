const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3500;
const cookieParser = require("cookie-parser");
app.use(express.json());
const appRouter = require("./routers/clientRouter");
const { dbConnect } = require("./database/database");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
dbConnect();

app.use("/client", appRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
