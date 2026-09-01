import type { Express } from "express";
import multer from "multer";
import { getVtoProvider } from "./vto";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const allowedTypes = new Set(["image/jpeg", "image/jpg", "image/png"]);

export function registerUploadRoutes(app: Express) {
  app.post("/api/upload/image", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "image_required" });
      if (!allowedTypes.has(req.file.mimetype)) return res.status(415).json({ message: "unsupported_format" });
      const bytes = new ArrayBuffer(req.file.buffer.byteLength);
      new Uint8Array(bytes).set(req.file.buffer);
      const result = await getVtoProvider().uploadImageBytes({ bytes, contentType: req.file.mimetype, fileName: req.file.originalname || "mirrorcart.jpg", kind: req.body?.kind === "garment" ? "garment" : "user" });
      return res.json({ fileId: result.fileId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "upload_failed";
      return res.status(502).json({ message });
    }
  });
}
