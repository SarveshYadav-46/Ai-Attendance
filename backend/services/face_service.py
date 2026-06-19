import insightface
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = insightface.app.FaceAnalysis()
app.prepare(ctx_id=0)

def generate_embedding(image):

    faces = app.get(image)

    if len(faces) == 0:
        return None

    return faces[0].embedding

def compare_faces(
    new_embedding,
    stored_embedding
):

    similarity = cosine_similarity(
        [new_embedding],
        [stored_embedding]
    )[0][0]

    return similarity