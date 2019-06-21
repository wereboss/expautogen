import express from "express";
import exphbs  from "express-handlebars";
import indexRouter from "./routes/index";
import usersRouter from "./routes/users";
var app = express();
const port = 3000; // default port to listen

app.engine('hbs', exphbs({
    extname: 'hbs'
}));
app.set('view engine', 'hbs');

// define a route handler for the default home page
app.get( "/hello", ( req, res ) => {
    res.send( "Hello world!" );
} );

app.use('/', indexRouter);
app.use('/users', usersRouter);

// start the Express server
app.listen( port, () => {
    console.log( `newer server started at http://localhost:${ port }` );
} );