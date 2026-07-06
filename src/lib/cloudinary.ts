/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const CLOUD_NAME = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || "druxacsxz";
const API_KEY = (import.meta as any).env?.VITE_CLOUDINARY_API_KEY || "838838814368756";
const UPLOAD_PRESET = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";

export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width?: number;
  height?: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  type: string;
  url: string;
  secure_url: string;
}

/**
 * Upload any File, Blob, or Base64 data URL to Cloudinary.
 * Handles both images and other clinical artifacts like PDF files.
 * 
 * @param file - The File, Blob, or Base64 string to upload
 * @param resourceType - Cloudinary resource type: 'image' or 'raw' or 'auto'
 * @returns The high-fidelity HTTPS secure URL of the asset from CloudinaryCDN
 */
export async function uploadToCloudinary(
  file: File | Blob | string,
  resourceType: 'image' | 'raw' | 'auto' = 'auto'
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('api_key', API_KEY);

  // Endpoint format specified by the user
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorResponse = await response.json().catch(() => ({}));
      const errorMsg = errorResponse.error?.message || `HTTP error ${response.status}`;
      throw new Error(`Cloudinary upload failed: ${errorMsg}`);
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('[Cloudinary] Integration Error during upload:', error);
    throw error;
  }
}

/**
 * Diagnostic check to verify Cloudinary config state.
 */
export function getCloudinaryConfig() {
  return {
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
    preset: UPLOAD_PRESET,
    isConfigured: !!CLOUD_NAME && !!API_KEY && !!UPLOAD_PRESET,
  };
}
