
import "dotenv/config";
import express from "express";
import cors from "cors";

import authRouter from "./routes/authRoutes.js";
import patientRouter from "./routes/patientRoutes.js";
import doctorRouter from "./routes/doctorRoutes.js";
import appointmentRouter from "./routes/appointmentRoutes.js";
import medicalRecordRouter from "./routes/medicalRecordRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hospital Management System API is running",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/patients", patientRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/medical-records", medicalRecordRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
