


// const mongoose = require("mongoose");

// async function connectToDB() {
//     try {
//         await mongoose.connect(process.env.MONGO_URI, {
//             family: 4
//         });

//         console.log("yay! Connected to Database");
//         console.log("DATABASE NAME:", mongoose.connection.name);
//     } catch (err) {
//         console.error("MongoDB connection failed:", err);
//     }
// }

// module.exports = connectToDB;


const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "1.1.1.1"
]);

async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("yay! Connected to Database");
        console.log("DATABASE NAME:", mongoose.connection.name);
    } catch (err) {
        console.error("MongoDB connection failed:", err);
    }
}

module.exports = connectToDB;