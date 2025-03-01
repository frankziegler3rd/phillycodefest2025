from typing import Union
from fastapi import FastAPI
import json
import os

app = FastAPI()

@app.get("/")
def read_root():
    user_library = []
    # lists all the books
    rag_books = os.listdir("./rag_storage/nomic/")
    for book in rag_books:
        book_path = os.path.join("./rag_storage/nomic/", book)
        with open(os.path.join(book_path, "book_info.json"), "r") as f:
            user_library.append(json.load(f))

    return user_library