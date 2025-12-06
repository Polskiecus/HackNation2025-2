import Listener
import Gielda
import User
import NewsHandler

main_users: dict[str, User] = {} #para [login][uzytkownik]
main_scheduler = Gielda.Scheduler(loadAkcjeFromPath("../Firmy/"), 60) #to trzyma eventy i akcje
