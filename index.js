// modules imports
import express from "express";
import { config } from "dotenv";
import { intiateApp } from "./src/intiate-app.js";

// files imports


config({path:'config/dev.config.env'});
const app = express();

intiateApp(app,express);