/**
 * Upload a file to Cloudinary via Direct Unsigned Upload
 * @param {File} file - The file to upload (Image, Audio, etc.)
 * @param {string} resourceType - 'image', 'video' (for audio), 'raw', or 'auto'
 * @returns {Promise<string>} - The secure HTTPS URL of the uploaded file
 */
export const uploadToCloudinary = async (file, resourceType = "auto") => {
  if (!file) return null;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dovf8p3tq";
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "toeicmaster_preset";

  // Cloudinary groups audio files under the 'video' resource type.
  const finalResourceType = resourceType === "audio" ? "video" : resourceType;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${finalResourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "Cloudinary upload failed");
    }

    const data = await response.json();
    return data.secure_url; // Returns the public secure HTTPS URL
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};
