const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const connectDB = require("./config/db")
const authRoutes = require("./src/routes/authRoutes")
const noteRoutes = require("./src/routes/noteRoutes")
const { globalLimiter } = require('./src/middlewares/rateLimiter');
const aiRoutes = require("./src/routes/aiRoutes");

dotenv.config();
const app = express();

connectDB();

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "https://www.giffyduck.com", "https://giffyduck.com"],
    credentials: true
}));
app.use(cookieParser());
app.use(globalLimiter);


app.use('/api/auth', authRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/ai", aiRoutes);

// Test Route
app.get('/', (req,res) => {
    res.send("API is Running...");
});


app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port : ${PORT}`);
});