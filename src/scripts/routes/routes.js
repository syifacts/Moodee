import Beranda from "../views/pages/beranda";
import Journaling from "../views/pages/journaling";
import Tracking from "../views/pages/tracking";


const routes = {
    '/': Beranda,
    '/beranda' : Beranda,
    '/tracking': Tracking,
    '/journaling' : Journaling
};

export default routes;