import Account from "../views/pages/account";
import Beranda from "../views/pages/beranda";
import Journaling from "../views/pages/journaling";
import Login from "../views/pages/login";
import Tracking from "../views/pages/tracking";


const routes = {
    '/': Beranda,
    '/beranda' : Beranda,
    '/tracking': Tracking,
    '/journaling' : Journaling,
    '/account': Account,
    '/login': Login
};

export default routes;