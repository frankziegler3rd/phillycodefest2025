from LightRAG.lightrag import LightRAG, QueryParam
from LightRAG.lightrag.llm.ollama import ollama_model_complete, ollama_embed
from LightRAG.lightrag.utils import EmbeddingFunc
from diffusers import StableDiffusionPipeline
import torch
import pdfplumber

import argparse
import json
import os

class Book:
    def __init__(self, uid: int, path: str = None):
        """
        Initialize a Book object.

        Args:
            uid (int): The unique identifier for the book.
            path (str, optional): The path to the book pdf file. Defaults to None.

        """
        self.uid = uid

        if path:
            assert os.path.exists(path), f"pdf path does not exist"
            self.path = path

        
        self.WORKING_DIR = os.path.join('./rag_storage/', str(uid))

        print("initializing book with uid: ", str(uid))

        self.rag = LightRAG(
            working_dir=self.WORKING_DIR,
            llm_model_func=ollama_model_complete,
            llm_model_name='qwen2.5:3b',
            embedding_func=EmbeddingFunc(
                embedding_dim=768,
                max_token_size=8192,
                func=lambda texts: ollama_embed(
                    texts,
                    embed_model="nomic-embed-text"
                )
            ),
        )

        if not os.path.exists(os.path.join(self.WORKING_DIR, "kv_store_full_docs.json")):
            print("digesting book...")
            self.digest()

        if not os.path.exists(f"{self.WORKING_DIR}/book_info.json"):
            assert self.generate_book_info(), f"failed to generate book info for book {str(uid)}"

            # adding char_ids for ease of use
            for i, character in enumerate(self.book_info["character_list"]):
                character["char_id"] = i

        self.book_info = json.load(open(f"{self.WORKING_DIR}/book_info.json", "r"))

        if not os.path.exists(f"{self.WORKING_DIR}/characters"):
            print("generating character avatars...")
            os.mkdir(f"{self.WORKING_DIR}/characters")
            assert self._generate_character_avatars(), f"failed to generate character avatars for book {str(uid)}"
        
        assert self.book_info.keys() == {"title", "summary", "character_list", "uid"}, f'book {str(uid)} info keys are not valid'

        print(f"book {str(uid)} is ready to use")

    def query(self, query:str, param:QueryParam):
        return self.rag.query(query, param=param)
    
    def _digest(self):
        """
        Digests the book pdf file and returns a string of the book text.
        """
        with pdfplumber.open(self.path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                self.rag.insert(text, ids=[i])
    
    def _generate_book_info(self):
        """
        Queries the book text to generate a book info JSON file in the working directory.
        The book info JSON should have the following format:
        {
            "title": str,
            "summary": str,
            "character_list": [
                {"name": str, "desc": str},
                ...
            ],
            "uid": int
        }
        If the book info JSON is generated successfully, it is saved to the file
        "{WORKING_DIR}/book_info.json". If the generation fails, the query output
        is saved to the file "{WORKING_DIR}/book_info.txt" instead.
        """
        book_info = self.rag.query("give me a json file of the book with this format, {title, summary, character_list:[{name, desc}, ...]}", 
                              param=QueryParam(mode="naive"))
        try:
            book_info = json.loads(book_info.split("```json")[1::2][0].split("```")[0].strip())
            book_info["uid"] = self.uid
            json.dump(book_info, open(f"{self.WORKING_DIR}/book_info.json", "w"), indent=4)
        except:
            try:
                book_info = json.loads(book_info)
                book_info["uid"] = self.uid
                json.dump(book_info, open(f"{self.WORKING_DIR}/book_info.json", "w"), indent=4)
                return True
            except:
                pass

            with open(f"{self.WORKING_DIR}/book_info.txt", "w") as f: 
                f.write(book_info)
                f.close()

            return False
        
    def _generate_character_avatars(self):
        try:
            pipe = StableDiffusionPipeline.from_pretrained("stablediffusionapi/anything-v5")
            pipe = pipe.to("mps")

            with torch.no_grad():
                for i, character in enumerate(self.book_info["character_list"]):
                    prompt = self.rag.query(f"give me a sentence about {character['name']}'s appearance, things like hair, eyes, facial structure, clothing, etc...", param=QueryParam(mode="naive"))
                    image = pipe(prompt, height=512, width=512, negative_prompt="NSFW, text, cropped, low quality").images[0]
                    image.save(f"{self.WORKING_DIR}/characters/{i}.png")
        except Exception as e:
            print(e)
            return False

        return True

if __name__ == "__main__":
    book = Book(1)
    while True:
        query = input(">>> ")
        print(book.query(query, QueryParam(mode="naive")))