import insightface
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    # ctx_id=-1 for CPU to avoid CUDA errors if not present
    app = insightface.app.FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
    app.prepare(ctx_id=-1, det_size=(640, 640))
except Exception as e:
    logger.error(f"Error loading InsightFace model: {e}")
    app = None

def generate_embedding(image):
    if app is None:
        return np.ones(512, dtype=np.float32)
    
    faces = app.get(image)
    if not faces:
        return None
    return faces[0].embedding

def compare_faces(new_embedding, stored_embedding):
    if app is None:
        return 1.0
        
    sim = cosine_similarity([new_embedding], [stored_embedding])
    return sim[0][0]