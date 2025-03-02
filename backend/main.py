from pydantic import BaseModel
from fastapi import FastAPI
from typing import Union, List, Dict
from LightRAG.lightrag import QueryParam
from rag import Book
import json
import os

app = FastAPI()

@app.get("/")
def read_root():
    user_library = []
    # lists all the books
    for bookuid in os.listdir("./rag_storage/"):
        book_info = os.path.join("./rag_storage/", bookuid, "book_info.json")
        if not os.path.exists(book_info):
            continue
        with open(book_info) as f:
            user_library.append(json.load(f))
    return user_library
class ChatParam(BaseModel):
    book_id: int
    char_name: Union[str, int]
    query: str
    conv_hist: Union[List[Dict], None]

@app.post("/chat/")
def chat(res: ChatParam):
    book = Book(uid=res.book_id)
    query_param = QueryParam('naive', conversation_history=[])
    if res.char_name != -1:
        return book.rag.query(res.query, param=query_param, system_prompt=f'you are {res.char_name}')
    return book.rag.query(res.query, query_param)