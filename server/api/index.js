import express from "npm:express";
import sqlite3 from "npm:sqlite3"; // For SQLite database driver
import { open } from "npm:sqlite"; // For easier SQLite access with async/await
import cors from "npm:cors";
import "jsr:@std/dotenv/load";

const app = express();
const port = 3003;

const key = Deno.env.get('PLAN98_API_KEY')

// Middleware to parse JSON
app.use(express.json());

app.use(cors());

// Initialize SQLite database
const initDb = async () => {
    const db = await open({
        filename: "./contact_form.db",
        driver: sqlite3.Database,
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    return db;
};

// API endpoint to handle form submissions
app.post("/api/contact", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const db = await initDb();
        await db.run("INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)", [
            name,
            email,
            message,
        ]);
        res.status(200).json({ message: "Contact form submitted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error saving contact form submission." });
    }
});

app.get("/api/contacts", async (req, res) => {
    const apiKey = req.headers["x-api-key"];

    if (apiKey !== key) {
        return res.status(403).json({ message: "Forbidden: Invalid API key" });
    }

    try {
        const db = await initDb();
        const rows = await db.all("SELECT * FROM contacts");
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving contacts" });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
