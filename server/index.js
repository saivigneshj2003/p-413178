const express = require('express');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

// Enable CORS
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, 'audiofile.wav');
  }
});

const upload = multer({ storage });

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// API endpoint to process audio
app.post('/api/process-audio', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const audioFilePath = req.file.path;
    console.log(`Audio file saved to: ${audioFilePath}`);

    // Get paths for Python and the script
    const pythonPath = path.join(__dirname, '../venv/Scripts/python.exe');
    const pythonScriptPath = path.join(__dirname, '../agents/stthragent.py');
    
    console.log('Python Path:', pythonPath);
    console.log('Script Path:', pythonScriptPath);
    console.log('Audio Path:', audioFilePath);

    // Run the Python script with the virtual environment's Python
    const pythonProcess = spawn(pythonPath, [pythonScriptPath, audioFilePath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let pythonOutput = '';
    let pythonError = '';

    pythonProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Python stdout:', output);
      pythonOutput += output;
    });

    pythonProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.error('Python stderr:', error);
      pythonError += error;
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code ${code}`);
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        console.error(`Error: ${pythonError}`);
        return res.status(500).json({ 
          error: 'Failed to process audio',
          details: pythonError 
        });
      }
      
      try {
        // Try to parse the output as JSON
        const result = JSON.parse(pythonOutput.trim());
        return res.status(200).json({ 
          message: 'Audio processed successfully',
          result: result
        });
      } catch (e) {
        console.error('Failed to parse Python output as JSON:', e);
        return res.status(500).json({ 
          error: 'Failed to parse Python output',
          details: pythonOutput
        });
      }
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python process:', error);
      return res.status(500).json({ 
        error: 'Failed to start Python process',
        details: error.message 
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
