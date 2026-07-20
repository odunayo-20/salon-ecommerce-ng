import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadImage(
  file: string,
  folder: string = "salon",
  options?: Record<string, unknown>
) {
  return cloudinary.uploader.upload(file, {
    folder,
    transformation: [
      { quality: "auto", fetch_format: "auto" },
    ],
    ...options,
  });
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export function getOptimizedImageUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  }
) {
  const transformations: Record<string, string | number>[] = [];

  if (options?.width) transformations.push({ width: options.width });
  if (options?.height) transformations.push({ height: options.height });
  if (options?.quality) transformations.push({ quality: options.quality });
  transformations.push({ fetch_format: "auto", quality: "auto" });

  return cloudinary.url(publicId, {
    transformation: transformations,
    format: options?.format || "auto",
  });
}
