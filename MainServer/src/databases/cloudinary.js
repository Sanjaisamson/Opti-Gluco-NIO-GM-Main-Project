const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: "dnydf4n8a",
  api_key: "151123324453975",
  api_secret: "y6jGmoQGmL5YEwKTl7S4Kx7KZ5Q",
});

module.exports = {
  cloudinary,
};
