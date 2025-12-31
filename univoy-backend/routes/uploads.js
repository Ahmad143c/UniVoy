const express = require('express');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const router = express.Router();

// MongoDB URI
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/univoy';

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return {
      filename: file.originalname,
      bucketName: 'uploads' // collection name in MongoDB
    };
  }
});

const upload = multer({ storage });

// Upload endpoint with error handling
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  // Return a url property for the uploaded file (by filename)
  res.json({
    file: req.file,
    url: `/files/${req.file.filename}`
  });
});

// Error handler for upload
router.use((err, req, res, next) => {
  console.error('Upload error:', err);
  res.status(500).json({ message: 'File upload failed', error: err.message });
});

// --- Add GET /files/:filename to stream files from GridFS ---
let gfsBucket;
mongoose.connection.once('open', () => {
  gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: 'uploads'
  });
});

// List all files in GridFS
router.get('/list', async (req, res) => {
  try {
    if (!gfsBucket) return res.status(500).json({ message: 'File system not initialized' });
    const files = await mongoose.connection.db.collection('uploads.files').find().toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'No files found' });
    }
    res.json({ files: files.map(f => ({ filename: f.filename, uploadDate: f.uploadDate, length: f.length, contentType: f.contentType })) });
  } catch (err) {
    res.status(500).json({ message: 'Error listing files', error: err.message });
  }
});

// GET /:filename - stream file from GridFS
router.get('/:filename', async (req, res) => {
  try {
    if (!gfsBucket) {
      return res.status(500).json({ message: 'File system not initialized' });
    }
    const files = await mongoose.connection.db.collection('uploads.files').find({ filename: req.params.filename }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }
    const file = files[0];
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);
    const readstream = gfsBucket.openDownloadStreamByName(file.filename);
    readstream.on('error', (err) => {
      res.status(500).json({ message: 'Error streaming file', error: err.message });
    });
    readstream.pipe(res);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving file', error: err.message });
  }
});

module.exports = router;
