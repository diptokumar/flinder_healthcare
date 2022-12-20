const cloudinary = require('cloudinary').v2;

    cloudinary.config({ 
    cloud_name: 'dwgeiee2x', 
    api_key: '461232697847616', 
    api_secret: 'FLvraiEYrOrJSHY43_5AIyBfEDA' 
  });

  module.exports = { cloudinary };