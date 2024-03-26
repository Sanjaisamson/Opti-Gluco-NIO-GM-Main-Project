const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const cookieParser = require("cookie-parser");
app.use(express.json());
const appRouter = require("./routers/clientRouter");
const { dbConnect } = require("./database/database");

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
dbConnect();

app.use("/client", appRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
