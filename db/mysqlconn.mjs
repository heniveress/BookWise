import mysql from "mysql2/promise";

const getConn = async () => {
  try {
    const conn = await mysql.createConnection({
      host: "localhost",
      user: "konyvek",
      database: "konyvajanlo",
      password: "123alma123",
    });
    conn.config.namedPlaceholders = true;
    return conn;
  } catch (err) {
    console.log(err.message);
  }
}

export const conn = await getConn();


