import express from "express";
var app = express();
const port = 3000; // default port to listen

// define a route handler for the default home page
app.get( "/", ( req, res ) => {
    res.send( "Hello world!" );
} );

// start the Express server
app.listen( port, () => {
    console.log( `some server started at http://localhost:${ port }` );
} );