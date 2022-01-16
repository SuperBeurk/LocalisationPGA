const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const appRoutes = require("./routes/index");
const database = require('./database');
const AppError = require("./utils/appError");
const app = express();

// Connect to database
database.connect().then(() => {
//True
    // Body parsing middleware
    app.use(bodyParser.json());

    // CORS
    app.use(cors({
        origin: "*"
    }));

    // Routes
    app.use("/", appRoutes);

    // handle undefined Routes
    app.use("*", (req, res, next) => {
        console.log("mauvais lien");
        return AppError({
            message: "Undefined route"
        }, req, res, next);
    });

    console.log(`Starting Sequelize + Express example on port 80...`);

    app.listen(80, () => {
        console.log(`Express server started on port 80.`);
    });

}).catch(() => {
// False
    console.log(`Error on launch db`);
});

