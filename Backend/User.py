import Gielda
import json
from math import exp
from random import uniform
from Gielda import Akcja

class User:
    akcje: dict[str, int]
    bilans: float
    login: str
    password: str

    def __init__(self, login: str, password: str):
        self.akcje = {}
        self.bilans = 0
        self.login = login
        self.password = password

    def __str__(self):
        return r"{" + f"login: {self.login}, bilans: {self.bilans}, akcje: " + json.dumps(self.akcje) + r"}"

    def read_from_json(self, json_data: json):
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

    def kup_akcje(self, akcja: Akcja, ilosc: int) -> (bool):
        if ilosc > akcja.remaining_shares or ilosc <= 0:
            print("za malo akcji")
            return (False)

        if akcja.shareprice() * ilosc > self.bilans:
            print("zbyt biedny")
            return (False)

        #zwieksz cene akcji
        akcja.dodaj_czynnik(1/(ilosc/(akcja.remaining_shares+1)))
        #stac i da sie kupic
        akcja.remaining_shares -= ilosc
        self.bilans -= akcja.shareprice() * ilosc
        if akcja.nazwa not in self.akcje:
            self.akcje[akcja.nazwa] = 0
        self.akcje[akcja.nazwa] += ilosc
        return (True)

    def sprzedaj_akcje(self, akcja: Gielda.Akcja, ilosc: int, zarabiaj: bool = True) -> (bool):
        if akcja.nazwa not in self.akcje:
            print("nie masz zadnej akcji")
            return (False)

        if ilosc > self.akcje[akcja.nazwa] or ilosc <= 0:
            print("nie ma tylu akcji")
            return (False)

        #sprzedaj akcje, bo je masz
        self.akcje[akcja.nazwa] -= ilosc
        #obniz cene akcji
        akcja.dodaj_czynnik((ilosc/(akcja.remaining_shares+1)))
        akcja.remaining_shares += ilosc
        if zarabiaj:
            self.bilans += akcja.shareprice() * ilosc
        return (True)

    def szacuj(self, enemy, budzet: float) -> (bool, float, float): #zwraca (udalo sie, networth(), kasa na stanie)
        if budzet < self.bilans:
            print("zbyt biedny")
            return (False, -1, -1)

        self.bilans -= budzet
        #failure = 1/exp(budzet)
        failure = -1
        if uniform(0, 1) < failure:
            print("nie fart, nie udalo sie : (")
            return (False, -1, -1)
        return (True, enemy.get_networth(), enemy.bilans)

    def get_raided(self, scheduler) -> bool:
        for nazwa_firmy in self.akcje.keys():
            if (False) == self.sprzedaj_akcje(scheduler.akcje[nazwa_firmy], (self.akcje[nazwa_firmy]+1)//2, zarabiaj=False):
                return False
        self.bilans /= 2
        return True

    def raid(self, enemy, budzet: float) -> (bool):
        if budzet < self.bilans:
            print("zbyt biedny")
            return (False)

        self.bilans -= budzet
        #zrob rng, trudno sie raiduje bogacza
        #failure = 1/exp(budzet/(max(enemy.get_networth(), 0.01)))
        failure = 0.5
        if uniform(0, 1) < failure:
            print("masz niefarta : ( raid sie nie udal")
            return (False)

        for nazwa_firmy in enemy.akcje.keys(): #sprzedaj polowe akcji xd
            if (False) == enemy.sprzedaj_akcje(nazwa_firmy, (enemy.akcje[nazwa_firmy]+1)//2, zarabiaj=False): #zaokraglane w gore
                return (False)
        enemy.bilans //= 2 #zrzuc polowe kasy w nicosc
        return (True)

def read_users_from_file(path: str) -> dict[str, User]:
    f = open(path).read()
    data = json.loads(f)

    users: dict[str, User] = {}
    for item in data:
        new_ = User("a", "a")
        users[item] = new_.read_from_json(data[item])
    return users

def write_users_to_file(path: str, users: dict[str, User]) -> None:
    f = open(path, "w")
    f.write("{")
    cnt = 0
    for login in users:
        f.write('\n\t"' + login + '" : {\n')
        f.write('\t\t"akcje" : ' + json.dumps(users[login].akcje) + ",\n")
        f.write('\t\t"login" : "' + str(users[login].login) + '",\n')
        f.write('\t\t"bilans" : ' + str(users[login].bilans) + ",\n")
        f.write('\t\t"password" : "' + str(users[login].password) + '"\n')
        f.write('\t}')
        cnt += 1
        if cnt != len(users):
            f.write(',')
    f.write("\n}")
    f.close()
