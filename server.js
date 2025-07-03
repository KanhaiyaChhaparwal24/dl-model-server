const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const frameRoutes = require('./routes/frameRoutes');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(express.static('public'));

app.use('/api', frameRoutes);

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    try {
      const frameData = JSON.parse(message);
      
      const frameController = require('./controllers/frameController');
      const result = await frameController.processFrame(frameData.frame);
      
      // Enhance the result with a more user-friendly message
      let detectedObject = result.prediction || "unknown object";
      let confidence = result.confidence ? (result.confidence * 100).toFixed(2) + "%" : "unknown";
      
      ws.send(JSON.stringify({ 
        status: 'success',
        message: `Detected: ${detectedObject} (Confidence: ${confidence})`,
        data: result 
      }));
    } catch (error) {
      console.error('Error processing frame:', error);
      ws.send(JSON.stringify({ 
        status: 'error', 
        message: error.message 
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server is ready`);
});