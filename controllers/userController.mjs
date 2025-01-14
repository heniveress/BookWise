import { mainMenu, userMenu } from "../helpers/menus.mjs";
import { conn } from "../db/mysqlconn.mjs";
import Joi from "joi";
//sha1 hash kódot számító függvény
import { createHash } from "crypto";

//ezt a függvényt használjuk middleware függvényként
//minden olyan oldal előtt, aminek a használatához be kell jelentkezni
export async function isAuth(req, res, next) {
  //ha a szesszióban el vannak tárolva a felhasználó adatai
  //akkor bejelentkezett - ezeket a bejelentkezéskor
  //írjuk ide be
  console.log(`check auth: ${req.session.user}`);
  if (req.session.user) {
    next(); 
  } else {
    res.redirect('/user/login');
  }
}

//
//adatellenőrzések
//
//regisztrálási adatok
function checkRegister(user) {
  const schema = Joi.object({
    name: Joi.string().min(1).max(100).required(),
    password: Joi.string().min(1).max(100).required(),
    password1: Joi.ref("password"),
    email: Joi.string()
      .pattern(/^([a-z0-9_]|\-|\.)+@(([a-z0-9_]|\-)+\.)+[a-z]{2,10}$/i)
      .required()
      .messages({ "string.pattern.base": "Az email cím hibás" }),
  });
  const result = schema.validate(user);
  return result;
  // a hiba típusát (pl.: 'string.pattern.base') ha magyarul saját üzenettel akarjuk kiírni
  //így találjuk meg, debugger-ben listázva:
  //result.error.details.map(err=>err.type)
}

//bejelentkezési  adatok
function checkLogin(user) {
  const schema = Joi.object({
    email: Joi.string()
      .pattern(/^([a-z0-9_]|\-|\.)+@(([a-z0-9_]|\-)+\.)+[a-z]{2,10}$/i)
      .required()
      .messages({ "string.pattern.base": "Az email cím hibás" }),
    password: Joi.string().min(1).max(100).required(),
  });
  const result = schema.validate(user);
  return result;
  // a hiba típusát (pl.: 'string.pattern.base') ha magyarul saját üzenettel akarjuk kiírni
  //így találjuk meg, debugger-ben listázva:
  //result.error.details.map(err=>err.type)
}
//GET kérés kiszolgálása a regisztráláshoz
//űrlap kiküldés
export async function register(req, res, next) {
  if (req.session.user) {
    //ha be van jelentkezve
    res.render("message", {
      menu: mainMenu,
      user: req.session.user,
      message: "Be van jelentkezve!",
    });
  } else {
    res.render("register", {
      menu: mainMenu,
      user: req.session.user,
      userData: {
        name: "",
        email: "",
      },
      error: "",
    });
  }
}

//POST kérés kiszolgálása a regisztráláshoz
//űrlap fogadás
export async function postRegister(req, res, next) {
  const userData = req.body;
  delete userData.submit; //erre nincs szükség

  //ellenőrzés
  const result = checkRegister(userData);

  if (result.error) {
    res.render("register", {
      menu: mainMenu,
      user: req.session.user,
      userData: userData,
      error: result.error.message,
    });
    return;
  }

  //van-e már ilyen email című felhasználó
  let rows = null;
  let fields = null;
  try {
    [rows, fields] = await conn.execute(
      "SELECT email FROM users WHERE email = :email",
      {
        email: userData.email,
      }
    );
  } catch (err) {
    next(err);
    return;
  }

  if (rows[0]) {
    //ha nincs, akkor ez undefined
    res.render("message", {
      menu: mainMenu,
      user: req.session.user,
      message: `Ezzel az email címmel már regisztráltak: ${userData.email}`,
    });
    return;
  }

  //a jelszónak a sha1 hash kódját tároljuk
  const hash = createHash("sha1").update(userData.password).digest("hex");

  try {
    [rows, fields] = await conn.execute(
      "INSERT INTO users (name, email, password) VALUES (:name, :email, :hash) ",
      {
        name: userData.name,
        email: userData.email,
        hash: hash,
      }
    );
  } catch (err) {
    next(err);
    return;
  }

  if (rows.affectedRows != 1) {
    res.render("message", {
      menu: mainMenu,
      user: req.session.user,
      message: "Sikertelen regisztrálás",
    });
    return;
  }

  res.render("message", {
    cim: "Regisztrálás sikerült",
    menu: mainMenu,
    user: req.session.user,
    message: "Sikeres regisztrálás",
  });
}

//GET kérés kiszolgálása a bejelentkezéshez
//űrlap kiküldés
export async function login(req, res, next) {
  if (req.session.user) {
    //ha be van jelentkezve
    res.render("message", {
      menu: mainMenu,
      user: req.session.user,
      message: "Be van jelentkezve!",
    });
  } else {
    res.render("login", {
      menu: mainMenu,
      user: req.session.user,
      userData: {
        email: "",
      },
      error: "",
    });
  }
}

//POST kérés kiszolgálása a bejelentkezéshez
//űrlap fogadás és bejelentkezés
export async function postLogin(req, res, next) {
  // console.log(req.body);

  const userData = req.body;
  delete userData.submit; //erre nincs szükség

  //ellenőrzés
  const result = checkLogin(userData);

  if (result.error) {
    res.render("login", {
      menu: mainMenu,
      user: req.session.user,
      userData: userData,
      error: result.error.message,
    });
    return;
  }

  const hash = createHash("sha1").update(userData.password).digest("hex");
  let rows = null;
  let fields = null;
  try {
    [rows, fields] = await conn.execute(
      "SELECT id, email, name, role FROM users WHERE email = :email AND password = :hash",
      {
        email: userData.email,
        hash: hash,
      }
    );
  } catch (err) {
    next(err);
    return;
  }

  //egy sort várunk, bejelentkezés nem sikerült
  if (rows.length != 1) {
    res.render("message", {
      menu: mainMenu,
      user: req.session.user,
      message: "Az akalmazás hibába futott",
    });
    return;
  }

  //sikeres bejelentkezés
  //töröljük a szesszió eddigi adatait
  req.session.regenerate(function (err) {
    if (err) next(err);

    //a felhasználó adatai tárolódnak a szesszióban
    req.session.user = rows[0];

    //kimentjük a szesszió adatokat, ha jön egy új kérés mielőtt
    //ez a függvény kilép, az már az új adatokat találja
    req.session.save(function (err) {
      if (err) return next(err);
      //átléptetjük a felhasználót a fő oldalra
      res.redirect("/");
    });
  });
}

//kijelentkezés
export async function logout(req, res, next) {
  //töröljük a felhasználó adatait a szesszióból
  req.session.user = null;
  //mentjük a szesszió adatokat
  req.session.save(function (err) {
    if (err) next(err);
    //újra indítjuk a szesszió belső adatait
    req.session.regenerate(function (err) {
      if (err) next(err);
      //a főoldalra kerül kijelentkezve
      res.redirect("/");
    });
  });
}

// export async function example(req, res, next) {
//
//}
