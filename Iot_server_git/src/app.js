const express = require("express");
const app = express();
const PORT = process.env.PORT || 3500;
// const cookieParser = require("cookie-parser");
app.use(express.json());
const appRouter = require("./routers/clientRouter");
const { dbConnect } = require("./database/database");

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

async function bootStrap() {
  await dbConnect();
  console.log("app started");
  app.use("/client", appRouter);
  if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  }
}
bootStrap();

module.exports = { app };
