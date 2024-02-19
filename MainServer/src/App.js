const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 3000;
const cookieParser = require('cookie-parser')
const appRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes')
const {dbConnect} = require('./databases/db');

app.use(express.json());

dbConnect();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api', appRoutes);
app.use('/product', productRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

