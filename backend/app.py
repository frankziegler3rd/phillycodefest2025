from LightRAG.lightrag import LightRAG, QueryParam
from LightRAG.lightrag.llm.ollama import ollama_model_complete, ollama_embed
from LightRAG.lightrag.utils import EmbeddingFunc
import json


WORKING_DIR = "./rag_storage/nomic/achrismascarol"

# Initialize LightRAG with Ollama model
rag = LightRAG(
    working_dir=WORKING_DIR,
    llm_model_func=ollama_model_complete,  # Use Ollama model for text generation
    llm_model_name='qwen2.5:3b', # Your model name
    # llm_model_name='dimweb/gemma2-9b-it-simpo:Q4_0',
    # Use Ollama embedding function
    embedding_func=EmbeddingFunc(
        embedding_dim=768,
        max_token_size=8192,
        func=lambda texts: ollama_embed(
            texts,
            embed_model="nomic-embed-text"
        )
        # embedding_dim=4096,
        # max_token_size=32768,
        # func=lambda texts: ollama_embed(
        #     texts,
        #     embed_model="avr/sfr-embedding-mistral"
        # )
    ),
)

book_info = rag.query("give me a json file of the book with this format, {title, summary, character_list:[{name, desc}, ...]}", QueryParam(mode="naive"))
print(book_info)
try:
    book_info = json.loads(book_info.split("```json")[1::2][0].split("```")[0].strip())
    json.dump(book_info, open(f"{WORKING_DIR}/book_info.json", "w"), indent=4)
except:
    try:
        book_info = json.loads(book_info)
        json.dump(book_info, open(f"{WORKING_DIR}/book_info.json", "w"), indent=4)
        exit()
    except:
        pass
    with open(f"{WORKING_DIR}/book_info.txt", "w") as f: 
        f.write(book_info)





