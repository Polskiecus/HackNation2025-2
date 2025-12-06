import os
import json
import random


PATH = "../Newsy/"

def LoadFromPath(path: str):
    f = open(path)
    data = json.loads(f.read())
    f.close()

    return News(data["nazwa"], data["tresc"], data["efekty"])

def LoadFolder(path: str=None):
    global PATH
    if path == None or path == "":
        path = PATH

    if path[-1] != "/":path+="/"

    out = []
    files = os.listdir(path)
    for file_ in files:
        out.append(LoadFromPath(path+file_))

    return NewsHandler(out)

class News:

    def __init__(self, nazwa: str, tresc: str, efekty: dict={}):
        self.nazwa  = nazwa
        self.tresc  = tresc
        self.efekty = efekty


    def __str__(self):
        return self.tresc

class NewsHandler:

    def __init__(self, newsy: [News]):
        self.newsy = newsy

    def random_news(self):
        return random.choice(self.newsy)

if __name__ == "__main__":
    n = LoadFolder()
    print(n.random_news())
