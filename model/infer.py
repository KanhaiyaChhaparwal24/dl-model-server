#!/usr/bin/env python

import sys
import os
import json
import time
import numpy as np
from PIL import Image

try:
    import torch
    has_torch = True
except ImportError:
    has_torch = False

try:
    import tensorflow as tf
    has_tf = True
except ImportError:
    has_tf = False

def load_image(image_path):
    try:
        img = Image.open(image_path)
        img = img.resize((224, 224))
        img_array = np.array(img) / 255.0
        
        if len(img_array.shape) == 2:
            img_array = np.stack((img_array,) * 3, axis=-1)
        
        if img_array.shape[2] == 4:
            img_array = img_array[:, :, :3]
            
        return img_array
    except Exception as e:
        print(json.dumps({"error": f"Error loading image: {str(e)}"}))
        sys.exit(1)

def run_inference_dummy(img_array):
    mean_brightness = np.mean(img_array)
    std_brightness = np.std(img_array)
    
    return {
        "prediction": "unknown",
        "confidence": 0.0,
        "mean_brightness": float(mean_brightness),
        "std_brightness": float(std_brightness),
        "note": "This is a dummy result since no deep learning framework was found",
        "timestamp": time.time()
    }

def run_inference_pytorch(img_array):
    try:
        import io
        from contextlib import redirect_stdout
        
        import torchvision.transforms as transforms
        from torchvision.models import resnet18
        
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                                std=[0.229, 0.224, 0.225])
        ])
        
        input_tensor = transform(img_array)
        input_batch = input_tensor.unsqueeze(0)
        
        with io.StringIO() as buf, redirect_stdout(buf):
            model = resnet18(pretrained=True)
        
        model.eval()
        
        with torch.no_grad():
            output = model(input_batch)
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            
        confidence, class_idx = torch.max(probabilities, dim=0)
        
        return {
            "framework": "pytorch",
            "prediction": int(class_idx.item()),
            "confidence": float(confidence.item()),
            "timestamp": time.time()
        }
    except Exception as e:
        return {
            "framework": "pytorch", 
            "error": str(e),
            "timestamp": time.time()
        }

def run_inference_tensorflow(img_array):
    try:
        import io
        from contextlib import redirect_stdout
        
        from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input
        from tensorflow.keras.applications.mobilenet_v2 import decode_predictions
        
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)
        
        with io.StringIO() as buf, redirect_stdout(buf):
            model = MobileNetV2(weights='imagenet')
        
        with io.StringIO() as buf, redirect_stdout(buf):
            preds = model.predict(img_array)
        
        decoded = decode_predictions(preds, top=1)[0][0]
        class_name, class_desc, confidence = decoded
        
        return {
            "framework": "tensorflow",
            "prediction": class_desc,
            "confidence": float(confidence),
            "timestamp": time.time()
        }
    except Exception as e:
        return {
            "framework": "tensorflow",
            "error": str(e),
            "timestamp": time.time()
        }

def main():
    try:
        sys.stdout.flush()
        
        if len(sys.argv) != 2:
            print(json.dumps({"error": "Please provide an image path"}))
            sys.exit(1)
        
        image_path = sys.argv[1]
        
        if not os.path.exists(image_path):
            print(json.dumps({"error": f"Image not found: {image_path}"}))
            sys.exit(1)
        
        img_array = load_image(image_path)
        
        if has_torch:
            result = run_inference_pytorch(img_array)
        elif has_tf:
            result = run_inference_tensorflow(img_array)
        else:
            result = run_inference_dummy(img_array)
        
        sys.stdout.flush()
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": f"Unexpected error in inference: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
