require("dotenv").config({ override: true });

const app = require("./src/app");
const port = 3000;

const connectToDB = require("./src/config/database");

connectToDB();

app.listen(port, () => {
    console.log("successfully created");
});