from fastapi import FastAPI, Request
import random

app = FastAPI()
Users   = {}
Cookies = {}


@app.post("/log_in")
async def Login():
	data = request.json()

	if data["login"] not in Users:
		return "User does not exist!"

	else:
		if Users[data["login"]]["pwd"] == data["pwd"]:
			num_ = random.randint(2**30)
			while num_ not in Cookies:
				num_ = random.randint(2**30)

			Cookies[num_] = data["login"]
			return num_

		else:
			return "Wrong Password!"

@app.post("/register")
async def Register():
	data = request.json()

	if data["login"] in Users:
		return "User already exists!"

	else:
		User[data["login"]] = {"pwd": data["pwd"]}
		return "User created!"


async def CheckUser():
	data = request.json()

	if data["Cookie"] in Cookies:
		return Cookies[data["Cookie"]]

	else:
		return "Wrong Cookie!"

