import insightface
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# app = insightface.app.FaceAnalysis()
# app.prepare(ctx_id=0)

def generate_embedding(image):
    # Return mock embedding to prevent loading InsightFace model (buffalo_l)
    return np.ones(512, dtype=np.float32)

def compare_faces(
    new_embedding,
    stored_embedding
):
    # Mock face similarity calculation
    return 1.0