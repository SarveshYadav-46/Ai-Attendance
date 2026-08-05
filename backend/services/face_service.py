import insightface

import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

_app = None

def get_app():
    global _app
    if _app is None:
        try:
            # Lazy load the smaller 'buffalo_s' model to save ~400MB RAM
            # Using det_size=(320, 320) reduces memory usage during inference
            _app = insightface.app.FaceAnalysis(name='buffalo_s', providers=['CPUExecutionProvider'])
            _app.prepare(ctx_id=-1, det_size=(320, 320))
            logger.info("InsightFace model loaded successfully.")
        except Exception as e:
            logger.error(f"Error loading InsightFace model: {e}")
            _app = False # Mark as failed to avoid repeated loading attempts
    return _app if _app is not False else None

def generate_embedding(image):
    app = get_app()
    if app is None:
        return np.zeros(512, dtype=np.float32)
    
    faces = app.get(image)
    if not faces:
        return None
    return faces[0].embedding

def compare_faces(new_embedding, stored_embedding):
    if get_app() is None:
        return 0.0
        
    # Optimized cosine similarity using pure numpy (no sklearn required)
    a = np.array(new_embedding)
    b = np.array(stored_embedding)
    
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
        
    return np.dot(a, b) / (norm_a * norm_b)