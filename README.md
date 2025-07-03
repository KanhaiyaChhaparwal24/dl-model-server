# Deep Learning Model Server

A Node.js server application for deploying deep learning models with WebSocket support for real-time camera frame processing.

## Features

- WebSocket server for real-time camera frame processing
- REST API endpoints for frame upload and processing
- Python integration for deep learning model inference with PyTorch (ResNet18) or TensorFlow (MobileNetV2)
- Object detection with human-readable labels from ImageNet
- Simple web interface for testing

## Project Structure

```
dl-model-server/
├── controllers/
│   └── frameController.js   # Controller for frame handling and Python interaction
├── model/
│   └── infer.py             # Python script for model inference (PyTorch/TensorFlow)
├── public/
│   └── index.html           # Web testing interface with camera support
├── routes/
│   └── frameRoutes.js       # API routes for frame processing
├── temp/                    # Temporary storage for frames (created at runtime)
├── server.js                # Main server file with WebSocket implementation
├── package.json
└── README.md
```

## Requirements

- Node.js 14.x or higher
- Python 3.6 or higher
- For deep learning capabilities (optional but recommended):
  - PyTorch 1.8+ or TensorFlow 2.4+
  - The application will use PyTorch's ResNet18 if available, then fall back to TensorFlow's MobileNetV2, and finally to a simple brightness-based classifier if neither is available

## Installation

1. Clone the repository:
```
git clone <repository-url>
cd dl-model-server
```

2. Install Node.js dependencies:
```
npm install
```

3. Install Python dependencies (for the inference script):
```
pip install pillow numpy
```

4. For deep learning capabilities, install one of the following:
```
# For PyTorch
pip install torch torchvision

# For TensorFlow
pip install tensorflow
```

## Usage

1. Start the server:
```
npm start
```

2. Access the web interface for testing:
Open your browser and navigate to `http://localhost:3000`

## API Endpoints

- **POST /api/frame**
  - Upload a frame for processing
  - Body: `{ "frame": "base64-encoded-image-data" }`
  - Response: `{ "status": "success", "result": { ... inference results ... } }`

- **GET /api/status**
  - Check server status
  - Response: `{ "status": "ok", "message": "Deep learning model server is running" }`

## WebSocket API

Connect to WebSocket at `ws://localhost:3000` and send messages in the format:
```json
{
  "frame": "base64-encoded-image-data"
}
```

The server will respond with inference results:
```json
{
  "status": "success",
  "message": "Detected: laptop (Confidence: 87.65%)",
  "data": {
    "framework": "pytorch",
    "prediction_idx": 620,
    "prediction": "laptop",
    "confidence": 0.8765,
    "timestamp": 1751520945.752
  }
}
```

## Customizing the Model

To use your own deep learning model:

1. Modify the `infer.py` script in the `model` folder
2. Replace the existing model loading and inference code with your own model
3. Ensure your model returns results in JSON format

## Troubleshooting

### Object Detection Issues

If the model returns "unknown object" with unknown confidence:

1. Check that PyTorch or TensorFlow is properly installed
2. Ensure the data type of tensor inputs matches the model's expectations:
   - For PyTorch, use `.float()` on input tensors
   - For TensorFlow, ensure proper preprocessing with `preprocess_input()`
3. Check for any error messages in the server console

### Port Already in Use

If you encounter an `EADDRINUSE` error when starting the server:

```
Error: listen EADDRINUSE: address already in use :::3000
```

You can free the port by terminating the process using it:

```powershell
# Windows PowerShell:
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess -Force

# Linux/macOS:
# kill $(lsof -t -i:3000)
```