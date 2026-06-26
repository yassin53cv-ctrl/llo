/* =============================================================
   cloudinary.js — VESTRA Image Upload Layer
   -------------------------------------------------------------
   HOW TO CONFIGURE:
   1. Replace YOUR_CLOUD_NAME with your Cloudinary Cloud Name.
      (Find it on your Cloudinary Dashboard → top-left corner)
   2. Replace YOUR_UPLOAD_PRESET with your unsigned Upload Preset name.
      (Cloudinary Dashboard → Settings → Upload → Upload Presets)
   3. Make sure the preset is set to "Unsigned" mode.
   ============================================================= */

/* ── STEP 1: Paste your Cloudinary credentials here ──────── */
const CLOUD_NAME    = "dp8ipvgmc";      // e.g. "dxyz12abc"
const UPLOAD_PRESET = "vestra_upload";   // e.g. "vestra_unsigned"
/* ─────────────────────────────────────────────────────────── */

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * uploadImageToCloudinary(file)
 *
 * Uploads an image File object to Cloudinary using an unsigned upload preset.
 * No API secret or backend server required — entirely frontend-safe.
 *
 * @param   {File}            file  The image file selected by the user.
 * @returns {Promise<string>}       Resolves with the Cloudinary secure_url (HTTPS).
 * @throws  {Error}                 If the upload fails for any reason.
 */
async function uploadImageToCloudinary(file) {
  if (!file || !file.type.startsWith("image/")) {
    throw new Error("uploadImageToCloudinary: argument must be an image File.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  /* ── DEBUG: log exactly what is about to be sent ───────────── */
  console.log("[Cloudinary] CLOUD_NAME    =", JSON.stringify(CLOUD_NAME));
  console.log("[Cloudinary] UPLOAD_PRESET =", JSON.stringify(UPLOAD_PRESET));
  console.log("[Cloudinary] Upload URL    =", CLOUDINARY_URL);
  console.log("[Cloudinary] FormData entries:");
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`   ${key} = File(name="${value.name}", type="${value.type}", size=${value.size}b)`);
    } else {
      console.log(`   ${key} = ${JSON.stringify(value)}`);
    }
  }
  /* ──────────────────────────────────────────────────────────── */

  const response = await fetch(CLOUDINARY_URL, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    let rawText = "";
    let errJson = null;
    try {
      rawText = await response.text();
      errJson = JSON.parse(rawText);
    } catch (_) { /* response wasn't valid JSON; rawText still holds the body */ }

    /* ── DEBUG: print the full, unfiltered error response ─────── */
    console.error("[Cloudinary] Upload FAILED");
    console.error("[Cloudinary] HTTP status:", response.status, response.statusText);
    console.error("[Cloudinary] Raw response body:", rawText);
    if (errJson) console.error("[Cloudinary] Parsed error object:", errJson);
    /* ──────────────────────────────────────────────────────────── */

    const detail = errJson?.error?.message ? ` — ${errJson.error.message}` : (rawText ? ` — ${rawText}` : "");
    throw new Error(`Cloudinary upload failed (${response.status})${detail}`);
  }

  const data = await response.json();
  console.log("[Cloudinary] Upload succeeded. Response:", data);

  if (!data.secure_url) {
    throw new Error("Cloudinary response did not include a secure_url.");
  }

  return data.secure_url;
}