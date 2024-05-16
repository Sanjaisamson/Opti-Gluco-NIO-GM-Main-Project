const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");
const cookieParser = require("cookie-parser");
const appRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const { dbConnect } = require("./databases/db");

app.use(cookieParser());
app.use(cors());

app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({ limit: "50mb", extended: true }));

async function bootstrap() {
  await dbConnect();
  app.use("/api", appRoutes);
  app.use("/product", productRoutes);
  if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  }
}

bootstrap();

module.exports = { app };
