import json


def loadAkcjeFromPath(path: str) -> Akcja:

	files = os.listdir(path)
	if len(path) > 0:
		if path[-1] != '/':
			path += "/"

	Akcje = []
	for file in files:
		Akcje.append(loadAkcjaFromFile(path + file)

	return Akcje

def loadAkcjaFromFile(path: str) -> Akcja:

	f = open(path)
	data = read().split()
	f.close()

	return Akcja(data[0], data[1], data[2], data[3])

class Akcja:

	def __init__(self, nazwa: str, wartosc: float, remaining_shares: int):

		self.nazwa            = nazwa
		self.wartosc          = wartosc
		self.remaining_shares = remaining_shares
		self.shares_total     = shares_total

	def __str__(self):

		return f"{self.nazwa} {self.wartosc} {self.remaining_shares} {shares_total}"

	def export(self, path: str):

		f = open(path, "w")
		f.write(self.__str__)
		f.close()

	def update(self, czynniki: float):

		for czynnik in czynniki:
			self.wartosc *= czynnik

class Scheduler:

	def __init__(self, akcje: [Akcja]=[]):

		akcje = akcje
if __name__ == "__main__":


	
