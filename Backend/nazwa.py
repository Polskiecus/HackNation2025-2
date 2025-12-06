import Gielda

class User:
    akcje: dict[str, int]
    bilans: float
    id: int


    def __init__(self, id: int):
        self.akcje = {}
        self.bilans = 0
        self.id = id

    def get_bilans(self) -> (bool, float): #zwraca ile gracz ma kasy
        return (True, self.bilans)

    def get_networth(self) -> (bool, float): #oblicza ile "kasy" ma gracz

    def kup_akcje(self, akcja: Akcja, ilosc: int) -> (bool):
        if ilosc > akcja.remaining_shares:
            print("za malo akcji")
            return (False)

        if akcja.wartosc * ilosc:
            print("zbyt biedny")
            return (False)

        #stac i da sie kupic
        akcja.remaining_shares -= ilosc
        akcja.update_price()  # DO NAPISANIA
        self.bilans -= akcja.wartosc * ilosc
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
        akcja.update_price()  # DO NAPISANIA
        self.bilans += akcja.wartosc * ilosc
        return (True)

    def raid(self, enemy: User) -> (bool):
        pass