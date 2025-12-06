import Gielda
import json
from math import exp
from random import uniform

class User:
    akcje: dict[str, int]
    bilans: float
    name: str
    password: str

    def __init__(self, login: str, password: str):
        self.akcje = {}
        self.bilans = 0
        self.login = login
        self.password = password

    def __str__(self):
        return r"{" + f"login: {self.login}, bilans: {self.bilans}, akcje: " + json.dumps(self.akcje) + r"}"

    def read_from_json(self, json_data: json) -> User:
        self.akcje = json_data["akcje"]
        self.bilans = json_data["bilans"]
        self.password = json_data["password"]
        self.login = json_data["login"]
        return self

    def get_bilans(self) -> (bool, float): #zwraca ile gracz ma kasy
        return (True, self.bilans)

    def get_networth(self) -> (bool, float): #oblicza ile "kasy" ma gracz
        try:
            suma_kasy = self.bilans
            for nazwa_firmy in self.akcje.keys():
                suma_kasy += Gielda.Scheduler.akcje[nazwa_firmy] * self.akcje[nazwa_firmy]
            return (True, suma_kasy)
        except Exception as e:
            return (False, e)

    def kup_akcje(self, akcja: Gielda.Akcja, ilosc: int) -> (bool):
        if ilosc > akcja.remaining_shares:
            print("za malo akcji")
            return (False)

        if akcja.shareprice() * ilosc:
            print("zbyt biedny")
            return (False)

        #stac i da sie kupic
        akcja.remaining_shares -= ilosc
        akcja.update()
        self.bilans -= akcja.shareprice() * ilosc
        self.akcje[akcja.nazwa].setdefault(0, akcja.nazwa)
        self.akcje[akcja.nazwa] += ilosc
        return (True)

    def sprzedaj_akcje(self, akcja: Gielda.Akcja, ilosc: int) -> (bool):
        if akcja.nazwa not in self.akcje:
            print("nie zadnej akcji")
            return (False)

        if ilosc > self.akcje[akcja.nazwa]:
            print("nie masz tylu akcji")
            return (False)

        #sprzedaj akcje, bo je masz
        self.akcje[akcja.nazwa] -= ilosc
        akcja.remaining_shares += ilosc
        self.bilans += akcja.shareprice() * ilosc
        akcja.update()
        return (True)

    def szacuj(self, enemy, budzet: float) -> (bool, float, float):
        if budzet < self.bilans:
            print("zbyt biedny")
            return (False, -1, -1)

        self.bilans -= budzet
        failure = 1/exp(budzet)
        if uniform(0, 1) < failure:
            print("nie fart, nie udalo sie : (")
            return (False, -1, -1)
        return (True, enemy.get_networth(), enemy.bilans)

    def raid(self, enemy, budzet: float) -> (bool):
        if budzet < self.bilans:
            print("zbyt biedny")
            return (False)

        self.bilans -= budzet
        #zrob rng, trudno sie raiduje bogacza
        failure = 1/exp(budzet/(max(enemy.get_networth(), 0.01)))
        if uniform(0, 1) < failure:
            print("masz niefarta : ( raid sie nie udal")
            return (False)

        for nazwa_firmy in enemy.akcje.keys(): #sprzedaj polowe akcji xd
            if (False) == enemy.sprzedaj_akcje(nazwa_firmy, (enemy.akcje[nazwa_firmy]+1)//2): #zaokraglane w gore
                return (False)
        enemy.bilans //= 2 #zrzuc polowe kasy w nicosc
        return (True)

def read_users_from_file(path: str) -> dict[str, User]:
    f = open(path)
    data = json.load(f)
    f.close()
    users: dict[str, User] = {}
    for item in data:
        users[item["login"]] = User.read_from_json(item)
    f.close()
    return users