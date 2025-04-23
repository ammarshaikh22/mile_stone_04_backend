import { v2 as cloudinary } from "cloudinary";
import 'dotenv/config';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.Cloud_NAME,
    api_key: process.env.API_key,
    api_secret: process.env.API_Secret
});

export const uploadImageToCloudinary = async (localPath) => {
    try {
        const result = await cloudinary.uploader.upload(localPath, {
            resource_type: "auto",
        });
        fs.unlinkSync(localPath);
        return result.url;
    } catch (err) {
        console.error("Error uploading image to Cloudinary:", err);
        fs.unlinkSync(localPath);
        throw new Error("Failed to upload image to Cloudinary");
    }
};


