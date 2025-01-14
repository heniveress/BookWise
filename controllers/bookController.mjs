import { conn } from "../db/mysqlconn.mjs";

import { mainMenu, userMenu } from "../helpers/menus.mjs";

export async function bookListPage(req, res, next) {


    let menu = mainMenu;
    
    if (req.session.user){
      menu = userMenu;
    }

    const [result, fields] = await conn.execute('SELECT * FROM konyvek');

    let books = [];

    for (const book of result) {
      
      const [result2, fields2] =  await conn.execute(
        'SELECT data FROM boritokepek WHERE id = :kepId', {kepId: book.boritokep_id}
      );

      books.push({title: book.cim, id: book.id, img: result2[0].data})
      
    }

    res.render('bookList', { menu: menu, user: req.session.user, books:books });
 
}

export async function bookDetailsPage(req, res, next) {

  let menu = mainMenu;

  if (req.session.user){
    menu = userMenu;
  }

  const bookId = req.params['bookId'];

  const [result, fields] = await conn.execute(
    'SELECT * FROM konyvek WHERE id = :pBookId', {pBookId: bookId}
  );
    
  const [result2, fields2] =  await conn.execute(
    'SELECT * FROM boritokepek WHERE id = :imgId', {imgId: result[0].boritokep_id}
  );

  let userId = result[0].user_id;
  let cim = result[0].cim;
  let kiado = result[0].kiado;
  let ar = result[0].ar;
  let kiadasDatum = result[0].kiadas_datuma.toLocaleDateString();
  let leiras = result[0].leiras;
  let boritokep = result2[0].data;

  const [result3, fileds3] = await conn.execute(
    'SELECT nev FROM szerzok WHERE id = :szerzoId', {szerzoId: result[0].szerzo_id}
  );

  let szerzo = result3[0].nev;

  const [result4, fileds4] = await conn.execute(
    'SELECT nev FROM mufajok WHERE id = :mufajId', {mufajId: result[0].mufaj_id}
  );
  
  let mufaj = result4[0].nev;

  const [result5, fields5] = await conn.execute(
    'SELECT * FROM users WHERE id = :pUserId', {pUserId: userId}
  );

  let userName = result5[0].name;

  res.render('bookDetails', {menu: menu, user: req.session.user, bookId: bookId, userName: userName, userId: userId, cim: cim, szerzo: szerzo, kiado: kiado, ar: ar, mufaj: mufaj, kiadasDatum: kiadasDatum, leiras: leiras, boritokep: boritokep});
}


//uj ajanlas urlap
export async function getInsertForm(req, res, next) {

  let menu = mainMenu;
    
  if (req.session.user){
    menu = userMenu;
  }

  const [result, fields] = await conn.execute('SELECT * FROM mufajok');
  
  let mufajok = [];

  for (let mufaj of result) {
    mufajok.push({id: mufaj.id, nev: mufaj.nev});
  }

  res.render('insertBook', {menu: menu, user: req.session.user, mufajok: mufajok});
}


// //Uj konyvajanlas feltoltese
export async function postInsertForm(req, res, next) {

  let menu = mainMenu;
    
  if (req.session.user){
    menu = userMenu;
  }

  let userId = req.session.user.id;

  // console.log("alma", userId);

  let cim = req.body.cim;
  let szerzo = req.body.szerzo;
  let kiado = req.body.kiado;
  let ar = req.body.ar;
  let mufajId = req.body.mufaj;
  let kiadasDatum = req.body.datum;
  let leiras = req.body.leiras;
  let boritokep = req.file.buffer.toString('base64');

  const[result, field] = await conn.execute(
    'INSERT INTO boritokepek(nev, data ) VALUES( :nev, :data)',
    {
      nev: cim,
      data: boritokep
    }
  );

  console.log("insert 1 OK");

  const[result2, field2] = await conn.execute(
    'INSERT INTO szerzok(nev) VALUES( :nev)',
    {
      nev: szerzo
    }
  );

  console.log("insert 2 OK");

  let kepId = result.insertId;
  let szerzoId = result2.insertId;

  console.log('kepId:', kepId);
  console.log('szerzoId:', szerzoId);



  const [result3, fields3] = await conn.execute(
    'INSERT INTO konyvek(user_id, cim, szerzo_id, kiado, mufaj_id, leiras, ar, boritokep_id, kiadas_datuma) VALUES( :pUserId, :pCim, :pSzerzoId, :pKiado, :pMufajId, :pLeiras, :pAr, :pBoritokepId, :pKiadasDatum)',
    {
      pUserId: userId,
      pCim: cim,
      pSzerzoId: szerzoId,
      pKiado: kiado,
      pMufajId: mufajId,
      pLeiras: leiras, 
      pAr: ar,
      pBoritokepId: kepId,
      pKiadasDatum: kiadasDatum
    }
  );

  console.log("insert 3 OK");


  res.render('message',{menu: menu, user: req.session.user, message: "Sikeres feltoltes"});
  
}


export async function getEditForm(req, res, next) {

  let menu = mainMenu;
    
  if (req.session.user){
    menu = userMenu;
  }

  const [resultMufaj, fieldsM] = await conn.execute('SELECT * FROM mufajok');
  
  let mufajok = [];

  for (let mufaj of resultMufaj) {
    mufajok.push({id: mufaj.id, nev: mufaj.nev});
  }

  // console.log(mufajok);

  let bookId = req.params['bookId'];

  const [result, fields] = await conn.execute(
    'SELECT * FROM konyvek WHERE id = :id', {id: bookId}
  );


  let isoDate = new Date(result[0].kiadas_datuma).toISOString().split('T')[0];

  const book = {
    id: result[0].id,
    cim: result[0].cim,
    szerzoId: result[0].szerzo_id,
    szerzoNev: "",
    kiado: result[0].kiado,
    mufajId: result[0].mufaj_id,
    mufajNev: "",
    leiras: result[0].leiras,
    ar: result[0].ar,
    kiadasDatum: isoDate
  };

  const [result2, fields2] = await conn.execute(
    'SELECT * FROM szerzok WHERE id = :id', {id: book.szerzoId}
  );

  const [result3, fields3] = await conn.execute(
    'SELECT * FROM mufajok WHERE id = :id', {id: book.mufajId}
  );

  book.szerzoNev = result2[0].nev;
  book.mufajNev = result3[0].nev;

  console.log(book.cim);

  res.render('editBook', {menu: menu, user: req.session.user, mufajok: mufajok, book: book});
}


export async function postEditForm(req, res, next) {

  let menu = mainMenu;
      

  if (req.session.user){
    menu = userMenu;
  }

  let bookId = req.params['bookId'];

  console.log(bookId);
  
  let cim = req.body['cim'];
  let szerzo = req.body['szerzo'];
  let kiado = req.body['kiado'];
  let mufajId = req.body['mufaj'];
  let leiras = req.body['leiras'];
  let ar = req.body['ar'];
  let kiadasDatum = req.body['datum'];

  console.log(cim);
  console.log(szerzo);
  console.log(kiado);
  console.log(mufajId);
  console.log(leiras);
  console.log(ar);
  console.log(kiadasDatum);

  const [resultBooks, fieldsSz] = await conn.execute(
    'SELECT * FROM konyvek WHERE id = :bookId', {bookId: bookId}
  );

  console.log(resultBooks);

  let szerzoId = resultBooks[0].szerzo_id;

  const [result, fields] = await conn.execute(
    'UPDATE konyvek SET cim = :pCim, szerzo_id = :pSzerzoId, kiado = :pKiado, mufaj_id = :pMufajId, leiras = :pLeiras, ar = :pAr, kiadas_datuma = :pKiadasDatuma WHERE id = :pBookId',
    {
      pBookId: bookId,
      pCim: cim,
      pSzerzoId: szerzoId,
      pKiado: kiado,
      pMufajId: mufajId,
      pLeiras: leiras,
      pAr: ar,
      pKiadasDatuma: kiadasDatum
    }
  );

  const [resultSz, fieldSz] = await conn.execute(
    'UPDATE szerzok SET nev = :pNev WHERE id = :id', {pNev: szerzo, id: szerzoId}
  );

  res.render('message', {menu: menu, user: req.session.user, message: "Sikeres frissites"});
}

export async function removeBook (req, res, next) {
  
  let menu = mainMenu;
    
  if (req.session.user){
    menu = userMenu;
  }

  let bookId = req.params['bookId'];

  const [result, fields] = await conn.execute(
    'DELETE FROM konyvek WHERE id = :bId', {bId: bookId}
  );

  res.render('message', {menu: menu, user: req.session.user, message: "Sikeres torles"});
}


export async function find(req, res, next) {

let menu = mainMenu;
    
if (req.session.user){
  menu = userMenu;
}
  
  res.render('find', {menu: menu, user: req.session.user});
}

export async function postFind(req, res, next) {

  let menu = mainMenu;
      
  if (req.session.user){
    menu = userMenu;
  }

  let result, fields;

  const searchBy = req.body['searchBy'];
  const text = req.body['searchText'];


  if (searchBy === "cim") {
    
    let queryText = "%" + text + "%";

    [result, fields] = await conn.execute(
      'SELECT * FROM konyvek WHERE cim LIKE :cim', {cim: queryText}
    );
  }
  else if (searchBy === "ar") {
    let queryNum = +text; //szamma alakitom? vagy parseInt(text)

    [result, fields] = await conn.execute(
      'SELECT * FROM konyvek WHERE ar = :ar', {ar: queryNum}
    );
  }

  let books = [];

  for (const book of result) {
    
    const [result2, fields2] =  await conn.execute(
      'SELECT data FROM boritokepek WHERE id = :kepId', {kepId: book.boritokep_id}
    );

    books.push({title: book.cim, id: book.id, img: result2[0].data})
    
  }
  
  res.render('bookList', {menu: menu, books: books, user: req.session.user});
}
