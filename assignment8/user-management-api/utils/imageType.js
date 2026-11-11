// utils/imageType.js
// Detects an image's real type from its first bytes ("magic bytes"), ignoring the
// client-declared MIME type and file name. Returns { ext, mime } or null.
// Only PNG, JPEG, GIF and WebP are accepted. SVG, HTML and everything else return null.

const startsWith = (buffer, bytes, offset = 0) =>
    buffer.length >= offset + bytes.length && bytes.every((byte, i) => buffer[offset + i] === byte);

function detectImageType(buffer) {
    if (!Buffer.isBuffer(buffer)) return null;

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
        return { ext: 'png', mime: 'image/png' };
    }
    // JPEG: FF D8 FF
    if (startsWith(buffer, [0xff, 0xd8, 0xff])) {
        return { ext: 'jpg', mime: 'image/jpeg' };
    }
    // GIF: "GIF87a" or "GIF89a"
    if (startsWith(buffer, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
        startsWith(buffer, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])) {
        return { ext: 'gif', mime: 'image/gif' };
    }
    // WebP: "RIFF" + 4 size bytes + "WEBP"
    if (startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8)) {
        return { ext: 'webp', mime: 'image/webp' };
    }
    return null;
}

module.exports = { detectImageType };
