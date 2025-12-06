import Listener
import Gielda
import User
import NewsHandler

main_users: dict[str, User] = {}
main_scheduler = Gielda.Scheduler(loadAkcjeFromPath("../Firmy/"), 60)
