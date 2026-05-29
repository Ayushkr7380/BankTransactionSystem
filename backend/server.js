const dotenv = require("dotenv");
dotenv.config();
const app = require("./src/app");
const connectToDb = require("./src/config/db");


const PORT = process.env.PORT;

const server = app.listen(PORT, async () => {
    try {
        await connectToDb();
        console.log(`Server is running at PORT ${PORT}`);
    } catch (err) {
        console.error("DB connection failed:", err);
    }
});

server.on("error", (err) => {
    console.error("Server failed to start:", err);
});
