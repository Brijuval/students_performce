const express = require("express");
const router = express.Router();
const Result = require("../models/result");

// Add a result
router.post("/", async (req, res) => {
    try {
        const result = new Result(req.body);
        await result.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all results
router.get("/", async (req, res) => {
    try {
        const results = await Result.find();
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a result by ID
router.put("/:id", async (req, res) => {
    try {
        const updatedResult = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedResult) {
            return res.status(404).json({ error: "Result not found" });
        }
        res.json(updatedResult);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a result by ID
router.delete("/:id", async (req, res) => {
    try {
        const deletedResult = await Result.findByIdAndDelete(req.params.id);
        if (!deletedResult) {
            return res.status(404).json({ error: "Result not found" });
        }
        res.json({ message: "Result deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


module.exports = router;
