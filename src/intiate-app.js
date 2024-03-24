import db_connection from "../DB/db.connection.js";
import * as routers from './index.routes.js';
import { globalResponses } from "./middlewares/Global-responses.js";


export const intiateApp = (app,express)=>{

    const port = process.env.PORT;

    app.use(express.json());

    app.use('/auth',routers.authRouter);
    app.use('/user',routers.userRouter);
    app.use('/category',routers.categoryRouter);
    app.use('/SubCategory',routers.SubCategoryRouter);
    app.use('/brand',routers.BrandRouter);
    app.use(globalResponses)

    db_connection();
    app.listen(port,()=>{console.log(`the server is running on port ${port}`);});
}