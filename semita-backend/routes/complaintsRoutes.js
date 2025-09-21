import express from "express";
import { getAllComplaints, getOpenComplaints, getComplaintsPage } from "../controllers/complaintsController.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const complaints = await getAllComplaints();
  res.json(complaints);
});

router.get("/open", async (req, res) => {
  const complaints = await getOpenComplaints();
  res.json(complaints);
});

router.get("/page", async (req, res) => {
  const complaints = await getComplaintsPage();
  res.json(complaints);
});

export default router;
