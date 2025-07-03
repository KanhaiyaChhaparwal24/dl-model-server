const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const frameController = {
  /**
   * Process a camera frame and run model inference
   * @param {String} frameData - Base64 encoded image frame
   * @returns {Promise<Object>} - Inference result
   */
  processFrame: async (frameData) => {
    try {
      // Create a temporary file path for the frame
      const tempFramePath = path.join(__dirname, '../temp', `frame-${Date.now()}.jpg`);
      
      // Ensure temp directory exists
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Decode base64 and save frame to file
      const buffer = Buffer.from(frameData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      fs.writeFileSync(tempFramePath, buffer);
      
      // Call the Python inference script
      const result = await runInference(tempFramePath);
      
      // Clean up the temporary file
      fs.unlinkSync(tempFramePath);
      
      return result;
    } catch (error) {
      console.error('Error in processFrame:', error);
      throw error;
    }
  },
  
  /**
   * HTTP endpoint for handling frame uploads
   */
  handleFrameUpload: async (req, res) => {
    try {
      const { frame } = req.body;
      if (!frame) {
        return res.status(400).json({ status: 'error', message: 'No frame data provided' });
      }
      
      const result = await frameController.processFrame(frame);
      return res.json({ status: 'success', result });
    } catch (error) {
      console.error('Error handling frame upload:', error);
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }
};

/**
 * Run the Python inference script and return the results
 * @param {String} framePath - Path to the image file
 * @returns {Promise<Object>} - Parsed inference results
 */
function runInference(framePath) {
  return new Promise((resolve, reject) => {
    // Launch the Python script
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../model/infer.py'),
      framePath
    ]);
    
    let result = '';
    
    // Collect data from stdout
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    // Handle errors
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Error: ${data}`);
    });
    
    // Process completed
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python process exited with code ${code}`));
        return;
      }
      
      try {
        // Parse the JSON output from the Python script
        const inferenceResult = JSON.parse(result);
        resolve(inferenceResult);
      } catch (error) {
        reject(new Error(`Failed to parse inference result: ${error.message}`));
      }
    });
  });
}

module.exports = frameController;