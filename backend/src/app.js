const express = require("express");

const authRoutes = require('./routes/authRoutes');

const cookieParser = require("cookie-parser");
const cors = require("cors");
const globalErrorHandler = require("./middlewares/globalErrorHandler");

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const userRoutes = require("./routes/userRoutes");
const workshopRoutes = require("./routes/workshopRoutes");
const participantRoutes = require("./routes/participantRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const checkinRoutes = require("./routes/checkinRoutes");
    
app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/workshops", workshopRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/checkins", checkinRoutes);

// Serve static files for banner images
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(globalErrorHandler);


module.exports = app;