from pydantic import BaseModel
from fastapi import FastAPI
from typing import Union, List, Dict
from LightRAG.lightrag import QueryParam
from fastapi.staticfiles import StaticFiles
from rag import Book
import json
import os

app = FastAPI()

app.mount("/rag_storage", StaticFiles(directory="./rag_storage"), name="static")
app.mount("/library", StaticFiles(directory="./library"), name="static")

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

@app.post("/chat")
def chat(res: ChatParam):
    book = Book(uid=res.book_id)
    query_param = QueryParam('naive', response_type="Single Paragraph")
    if len(res.conv_hist) != 0:
        query_param = QueryParam('naive', conversation_history=res.conv_hist, response_type="Single Paragraph")

    print(res.query)
    if res.char_name == "":
        return book.rag.query(res.query, query_param)
    return book.rag.query(res.query, param=query_param, system_prompt=f'you are {res.char_name}')