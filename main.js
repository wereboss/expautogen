"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_handlebars_1 = __importDefault(require("express-handlebars"));
const index_1 = __importDefault(require("./routes/index"));
const users_1 = __importDefault(require("./routes/users"));
var app = express_1.default();
const port = 3000; // default port to listen
app.engine('hbs', express_handlebars_1.default({
    extname: 'hbs'
}));
app.set('view engine', 'hbs');
// define a route handler for the default home page
app.get("/hello", (req, res) => {
    res.send("Hello world!");
});
app.use('/', index_1.default);
app.use('/users', users_1.default);
// start the Express server
app.listen(port, () => {
    console.log(`newer server started at http://localhost:${port}`);
});
