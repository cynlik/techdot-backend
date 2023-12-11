import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

class Database {
	constructor() {
		this._connect();
	}

	_connect() {
		mongoose
			.connect(process.env.DBURL as string)
			.then(() => {
				console.log("Database connection successful");
			})
			.catch((err) => {
				console.log("Database connection error");
			});
	}
}

export const config = {
	secret: process.env.SECRET as string,
	expiresIn: Number(process.env.EXPIRESIN),
	saltRounds: 10,
};

export const db = new Database();
