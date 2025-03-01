from flask import Flask, render_template, request
from LightRAG.lightrag import LightRAG, QueryParam
from LightRAG.lightrag.llm.ollama import ollama_model_complete, ollama_embed
from LightRAG.lightrag.utils import EmbeddingFunc

app = Flask(__name__)

WORKING_DIR = "./rag_storage"

# Initialize LightRAG with Ollama model
rag = LightRAG(
    working_dir=WORKING_DIR,
    llm_model_func=ollama_model_complete,  # Use Ollama model for text generation
    llm_model_name='qwen2.5:3b', # Your model name
    # Use Ollama embedding function
    embedding_func=EmbeddingFunc(
        embedding_dim=768,
        max_token_size=8192,
        func=lambda texts: ollama_embed(
            texts,
            embed_model="nomic-embed-text"
        )
    ),
)

chat = []
@app.route("/")
def index():
    return render_template("index.html", chat=chat)
    
@app.route('/submit', methods=['POST'])
def submit():
    query = request.form["query"]
    response = rag.query(query, param=QueryParam(mode="naive"))
    chat.append((query, response))
    return render_template("index.html", chat=chat)

if __name__ == "__main__":
    app.run(debug=True)