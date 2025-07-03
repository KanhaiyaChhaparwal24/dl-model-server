# Deep Learning Model Server

A Node.js server application for deploying deep learning models with WebSocket support for real-time camera frame processing.

## Features

- WebSocket server for real-time camera frame processing
- REST API endpoints for frame upload and processing
- Python integration for deep learning model inference
- Simple web interface for testing

## Project Structure

```
dl-model-server/
├── controllers/
│   └── frameController.js   # Controller for frame handling
├── model/
│   └── infer.py             # Python script for model inference
├── public/
│   └── index.html           # Web testing interface
├── routes/
│   └── frameRoutes.js       # API routes
├── temp/                    # Temporary storage for frames (created at runtime)
├── server.js                # Main server file
├── package.json
└── README.md
```

## Requirements

- Node.js 14.x or higher
- Python 3.6 or higher
- For PyTorch or TensorFlow (optional but recommended):
  - PyTorch 1.8+ or TensorFlow 2.4+

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
  "result": {
    "prediction": "object_class",
    "confidence": 0.95,
    ...
  }
}
```

## Customizing the Model

To use your own deep learning model:

1. Modify the `infer.py` script in the `model` folder
2. Replace the existing model loading and inference code with your own model
3. Ensure your model returns results in JSON format