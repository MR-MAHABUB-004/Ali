const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const editRoutes = require("./routes/edit");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// Rate limiting
// ===============================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: "Too many requests, please try again later."
    }
});

// Apply limiter to edit requests
app.use("/edit", limiter);
app.use("/edit=", limiter);

// ===============================
// Routes
// ===============================

// Standard routes
app.use("/", editRoutes);

// ===============================
// Home route
// ===============================
app.get("/", (req, res) => {
    res.json({
        status: "online",
        service: "Image-to-Image API",
        version: "1.0.0",

        usage: {
            standard_endpoint: "/edit",

            standard_format:
                "/edit?image=<image_url>&prompt=<your_prompt>",

            custom_format:
                "/edit=<image_url>$prompt=<your_prompt>",

            optional_params:
                "&strength=<0-1>&steps=<1-150>&seed=<number>",

            example_standard:
                "/edit?image=https%3A%2F%2Fexample.com%2Fimage.jpg&prompt=add%20text%20hi",

            example_custom:
                "/edit=https://example.com/image.jpg$prompt=add%20text%20hi"
        },

        endpoints: [
            "GET /edit?image=<image_url>&prompt=<prompt>",
            "GET /edit=<image_url>$prompt=<prompt>",
            "POST /api/edit",
            "POST /api/batch",
            "POST /api/inpaint",
            "GET /health"
        ]
    });
});

// ===============================
// Health check
// ===============================
app.get("/health", (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString()
    });
});

// ===============================
// Custom URL format support
// /edit=<image_url>$prompt=<prompt>
// ===============================
app.get(/^\/edit=(.+)\$prompt=(.+)$/, async (req, res, next) => {
    try {
        const imageUrl = req.params[0];
        const prompt = decodeURIComponent(req.params[1]);

        // Add parsed values to req.query
        req.query.image = imageUrl;
        req.query.prompt = prompt;

        // Pass request to edit route
        next();
    } catch (error) {
        console.error("Custom URL parsing error:", error);

        return res.status(400).json({
            status: false,
            error: "Invalid image URL or prompt"
        });
    }
});

// ===============================
// 404 Handler
// ===============================
app.use((req, res) => {
    res.status(404).json({
        status: false,
        error: "Route not found",
        path: req.originalUrl
    });
});

// ===============================
// Error handling
// ===============================
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        status: false,
        error: "Something went wrong!",
        message: err.message
    });
});

// ===============================
// Start server
// ===============================
app.listen(PORT, () => {
    console.log("=".repeat(50));
    console.log("🎨 Image-to-Image API Server");
    console.log("=".repeat(50));
    console.log(`✅ Server running on: http://localhost:${PORT}`);
    console.log(
        "📝 Standard: /edit?image=<url>&prompt=<prompt>"
    );
    console.log(
        "📝 Custom: /edit=<image_url>$prompt=<prompt>"
    );
    console.log("=".repeat(50));
});
