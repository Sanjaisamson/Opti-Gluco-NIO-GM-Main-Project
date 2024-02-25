const cloudinary = require("cloudinary").v2;

// Set the configuration
cloudinary.config({
  cloud_name: "dk6zuyjo9",
  api_key: "761269189833876",
  api_secret: "O9w3WknNKqSmOJYAOCbu52SdWlY",
});

// Export the configured cloudinary instance
module.exports = cloudinary;

module.exports = {
  cloudinary,
};
