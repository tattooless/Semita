import express from "express";
import complaintsRoutes from "./routes/complaintsRoutes.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Routes
app.use("/complaints", complaintsRoutes);

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
