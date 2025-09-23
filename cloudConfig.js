const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('@fluidjs/multer-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'wanderlust_DEV',
      allowed_formats: ["png", "jpg", "jpeg"], // ✅ small typo fixed (allowed_formats not allowedFormat)
      public_id: file.originalname.split('.')[0], // ✅ string only
    };
  },
});

module.exports ={
    cloudinary,
    storage
}