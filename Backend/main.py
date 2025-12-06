from Listener import *
from Gielda import *
from User import *
from NewsHandler import *

main_users: dict[str, User] = User.read_users_from_file("./users.json") #para [login][uzytkownik]
main_scheduler = Gielda.Scheduler(loadAkcjeFromPath("../Firmy/"), 60) #to trzyma eventy i akcje
