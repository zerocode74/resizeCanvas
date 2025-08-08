const express = require('express');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');

const app = express();
const PORT = 3000;

app.get('/resize', async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send('Missing image URL');

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imgBuffer = Buffer.from(response.data, 'binary');
    const img = await loadImage(imgBuffer);

    // Ukuran gambar dan canvas
    const targetWidth = 800;
    const targetHeight = 400;
    const canvasWidth = 1080;
    const canvasHeight = 700;
    const radius = 40; // radius border

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // Hitung posisi tengah
    const x = (canvasWidth - targetWidth) / 2;
    const y = (canvasHeight - targetHeight) / 2;

    // Buat clip path rounded rectangle
    ctx.save(); // simpan state
    roundedRect(ctx, x, y, targetWidth, targetHeight, radius);
    ctx.clip(); // aktifkan clipping path

    // Gambar gambar input di area yang sudah dibulatkan
    ctx.drawImage(img, x, y, targetWidth, targetHeight);
    ctx.restore(); // kembalikan state tanpa clipping

    // Kirim hasil
    res.set('Content-Type', 'image/png');
    canvas.pngStream().pipe(res);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Failed to process image');
  }
});

// Fungsi menggambar rounded rectangle path
function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

app.listen(PORT, () => {
  console.log(`🖼️ Server running at http://localhost:${PORT}`);
});
