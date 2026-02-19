const { computeDirections } = require("../services/directions.service");

async function compute (req, res) {
    try {
        const { start, end } = req.body;
        
        const result = await computeDirections(start, end);

        return res.status(200).json( result );
    } catch (err) {
        if (err.code === "MISSING_GOOGLE_KEY") {
            return res.status(500).json({ error: { code: "SERVER_MISCONFIG", message: "Google API key is missing"} 
            });
        }
        if (err.code === "INVALID_COORDS") {
            return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid start/end coordinates" },
            });
        }
        if (err.code === "DIRECTIONS_ERROR" || err.code === "DIRECTIONS_BAD_RESPONSE") {
            return res.status(502).json({ 
                error: { 
                    code: "DIRECTIONS_FAILED", 
                    message: "Failed to compute directions" ,
                    googleStatus: err.googleStatus,
                    googleErrorMessage: err.googleErrorMessage,
                },
            });
        }

        console.log("❌ Directions compute error: ", err.message);
        return res.status(500).json({ 
            error: { code: "INTERNAL_ERROR", message: "Unexpected error" }, 
            });
        }
    }

    module.exports = { compute };

        
        