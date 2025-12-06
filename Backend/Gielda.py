import json
import time
import os


FirmyPath = "../Firmy/"

def loadAkcjeFromPath(path: str) -> Akcja:

	files = os.listdir(path)
	if len(path) > 0:
		if path[-1] != '/':
			path += "/"

	Akcje = []
	for file in files:
		Akcje.append(loadAkcjaFromFile(path + file))

	return Akcje

def loadAkcjaFromFile(path: str) -> Akcja:

	new_ = Akcja()
	new_.reload_from_file(path)

	return new_

class Akcja:

	def __init__(self, nazwa: str="", wartosc: float=0, remaining_shares: int=0, historic_value: [float]=[0]):

		self.nazwa            = nazwa
		self.wartosc          = wartosc
		self.remaining_shares = remaining_shares
		self.shares_total     = shares_total

		self.historic_value   = historic_value
		self.czynniki         = []
		self.region           = ""


	def __str__(self):

		return f"{self.nazwa} {self.wartosc} {self.remaining_shares} {self.shares_total} {self.region}\n"+self.historic_value_str()

	def historic_value_str(self):

		return " ".join([float(item) for item in self.historic_value])

	def historic_value_float(self):

		return self.historic_value

	def export(self, path: str=None):
		global FirmyPath

		if path == None: path = FirmyPath + self.nazwa

		f = open(path, "w")
		f.write(self.__str__)
		f.close()

	def update(self):

		for czynnik in czynniki:
			self.wartosc *= czynnik

		self.czynniki = []

	def reload_from_file(self, path: str):

		f = open(path)
		data, historic = f.read().splitlines()
		data = data.split()
		f.close()

		self.nazwa = data[0]
		self.wartosc = float(data[1])
		self.remaining_shares = int(data[2])
		self.shares_total = int(data[3])
		self.region = data[4]
		self.historic_value   = [float(item) for item in historic.split() if item != ""]

	def dodaj_czynnik(czynnik: float):
		self.czynniki.append(czynnik)

	def shareprice(self):
		return round(self.wartosc/self.total_shares, 2)

class Scheduler:

	def __init__(self, akcje: [Akcja]=[], time_to_pass: float=0.2):

		self.akcje = {akcja.nazwa: akcja for akcja in akcje}
		self.time_to_pass = time_to_pass
		self.last_checked = time.time()

	def check_for_update(self):

		if self.last_checked + self.time_to_pass < time.time():
			self.update()


	def update(self):

		for akcja in self.akcje:
			self.akcje[akcja].update()

if __name__ == "__main__":

	Scheduler(loadAkcjeFromPath("../Firmy/"), 60)
