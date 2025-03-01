from LightRAG.lightrag import LightRAG, QueryParam
from LightRAG.lightrag.llm.ollama import ollama_model_complete, ollama_embed
from LightRAG.lightrag.utils import EmbeddingFunc

import argparse
import os

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LightRAG implementation.")
    parser.add_argument("book_txt_path", help="Path to the book text file.")
    parser.add_argument("working_dir", help="Path to the working directory for LightRAG.")

    args = parser.parse_args()
    if not os.path.exists(args.working_dir):
        os.mkdir(args.working_dir)

    print(f"Working directory: {args.working_dir}")
    print(f"Book text file: {args.book_txt_path}")

    print("initializing...")
    # Initialize LightRAG with Ollama model
    rag = LightRAG(
        working_dir=args.working_dir,
        llm_model_func=ollama_model_complete,  # Use Ollama model for text generation
        llm_model_name='qwen2.5:3b',
        # Use Ollama embedding function
        embedding_func=EmbeddingFunc(
            embedding_dim=4096,
            max_token_size=32768,
            func=lambda texts: ollama_embed(
                texts,
                embed_model="avr/sfr-embedding-mistral"
            )
        ),
    )

    print("inserting text...")
    # Insert text into the LightRAG model
    with open(args.book_txt_path, "r", encoding="utf-8") as f:
        rag.insert(f.read())

    # Generate text using the LightRAG model
    query = "Give me the name of the book and a short summary of the book."

    print(f"generating text... (query: {query})")
    print(rag.query(query, param=QueryParam(mode="naive")))
