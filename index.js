// index.js
const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const app = express();
app.use(bodyParser.json());

// 🔑 Load service account dari environment variable (Render / local .env)
const serviceAccount = JSON.parse(process.env.FCM_SERVICE_ACCOUNT_JSON || "{}");

// ✅ Inisialisasi Firebase Admin sekali saja
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Root endpoint → cek server hidup
app.get("/", (req, res) => {
  res.send("✅ Webhook FCM aktif & berjalan!");
});

// Endpoint untuk menerima request kirim push notif
app.post("/send", async (req, res) => {
  try {
    const { token, title, body } = req.body;

    if (!token || !title || !body) {
      return res
        .status(400)
        .json({ error: "Harus ada token, title, dan body di request." });
    }

    const message = {
      notification: {
        title,
        body,
      },
      token, // device token dari aplikasi
    };

    const response = await admin.messaging().send(message);
    res.json({ success: true, response });
  } catch (err) {
    console.error("Error kirim notif:", err);
    res.status(500).json({ error: err.message });
  }
});

// Jalankan server di Render (PORT otomatis dari environment)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});
