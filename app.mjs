import express from 'express';
import http from 'http';
import { join } from 'path';
import expressLayouts from 'express-ejs-layouts';
import httpStatus from 'http-status-codes';
import morgan from 'morgan';
import session from "express-session";

import { __dirname } from './dirname.mjs';
import { mainMenu } from "./helpers/menus.mjs";

const app = express();

app.use(morgan("dev")); 


app.set("view engine", "ejs");
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

//szessziókezelés
app.use(session( {
  secret: 'Lea kutyus budi labija',
  resave: false,
  saveUninitialized: true
  }
));

import { router as indexRouter } from './routes/index.mjs';
import { router as userRouter }  from './routes/user.mjs'; 
import { router as bookRouter }  from './routes/book.mjs'; 

app.use(express.urlencoded({ extended: false }));

// app.use(userController.isAuth);
app.use('/css', express.static(join(__dirname, 'assets/css')))
app.use('/js', express.static(join(__dirname, 'assets/js')))
app.use('/images', express.static(join(__dirname, 'assets/images')))

// útvonalválasztók
app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/book', bookRouter);


//hibakezelés
app.use((req, res)=>{
  const err = httpStatus.NOT_FOUND;
  console.log(`Rossz webcím: ${req.path}`);
  const error = httpStatus.NOT_FOUND; //404
  res.status(error).
  render("message", {
    menu: mainMenu,
    user: req.session.user,
    message: `404-es hiba. Ez a weblap nem létezik`
  });

});

app.use((err, req, res, next)=>{
  console.error(err.message);

  const error = httpStatus.INTERNAL_SERVER_ERROR; // 500
  res.status(error).
  render("message", {
    menu: mainMenu,
    user: req.session.user,
    message: `505-ös hiba. Az alkalmazás hibába futott`
  });
});

const server = http.createServer(app);

server.listen(3000, ()=>{
  console.log("szerver fut a 3000-esen");
});