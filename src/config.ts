import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

class Database {
  constructor() {
    this._connect();
  }

  _connect() {
    mongoose
      .connect(process.env.DBURL)
      .then(() => {
        console.log('Database connection successful');
      })
      .catch((err) => {
        console.log('Database connection error');
      });
  }
}

export const config = {
  secret: process.env.SECRET,
  expiresIn: Number(process.env.EXPIREPASSWORD),
  saltRounds: 10,
};

export const db = new Database();
