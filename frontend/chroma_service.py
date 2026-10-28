import chromadb
from chromadb.utils import embedding_functions
from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

app = FastAPI()

client = chromadb.PersistentClient(path="./chroma_data")
emb_fn = embedding_functions.DefaultEmbeddingFunction()
collection = client.get_or_create_collection(
    name="maintenance_fault_logs",
    embedding_function=emb_fn
)

class QueryRequest(BaseModel):
    query: str
    n_results: int = 3

@app.post("/search")
def search_endpoint(req: QueryRequest):
    res = collection.query(query_texts=[req.query], n_results=req.n_results)
    results = []
    for i in range(len(res["ids"][0])):
        results.append({
            "id": res["ids"][0][i],
            "document": res["documents"][0][i],
            "metadata": res["metadatas"][0][i]
        })
    return {"success": True, "results": results}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)