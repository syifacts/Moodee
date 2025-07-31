import Account from "../views/pages/account";
import Beranda from "../views/pages/beranda";
import Journaling from "../views/pages/journaling";
import Komentar from "../views/pages/komentar";
import Login from "../views/pages/login";
import Register from "../views/pages/register";
import Tracking from "../views/pages/tracking";


const routes = {
    '/': Beranda,
    '/beranda' : Beranda,
    '/tracking': Tracking,
    '/journaling' : Journaling,
    '/account': Account,
    '/login': Login,
    '/register': Register,
    '/komentar/:id' : Komentar
};

export default routes;