import 'reflect-metadata';
import { config } from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import { routeCollection } from './infrastructure/routeCollection';
import './controllers/EmployeeController';
import './controllers/TeamController';
import './models/repositories/employeeRepository';
import './models/repositories/teamRepository';

config();

const app = express();
const port =  process.env.PORT || 2900;

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());

const router = express.Router();
routeCollection.setupRouter(router);
app.use(router);

app.listen(port, () => {
  console.info(`Server listening on port ${port}`);
});