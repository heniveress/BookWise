
import { mainMenu, userMenu } from "../helpers/menus.mjs";

export const home = async (req, res, next) => {
    try {

      let menu = mainMenu;
      
      if (req.session.user){
        menu = userMenu;
      }

      res.render('index', { menu: menu, user: req.session.user });
    } catch (err) {
      next(err);
    }
}