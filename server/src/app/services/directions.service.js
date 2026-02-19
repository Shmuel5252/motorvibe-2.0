const axios = require("axios");

function ensureNumber(n){
    return typeof n === "number" && Number.isFinite(n);
}

function validatePoint(p) {
    return (
        p &&
        ensureNumber(p.lat) && 
        ensureNumber(p.lng) &&
        p.lat >= -90 && 
        p.lat <= 90 &&
        p.lng >= -180 && 
        p.lng <= 180
    );
}

async function computeDirections(start, end) {
    if(!process.env.GOOGLE_MAPS_API_KEY) {
        const arr = new Error("Missing GOOGLE_MAPS_API_KEY");
        arr.code = "MISSING_GOOGLE_KEY";
        throw arr;
    }

    if (!validatePoint(start) || !validatePoint(end)) {
        const arr = new Error("Invalid start/end coordinates");
        arr.code = "INVALID_COORDS";
        throw arr;
    }

    const origin = `${start.lat},${start.lng}`;
    const destination = `${end.lat},${end.lng}`;

    const url = "https://maps.googleapis.com/maps/api/directions/json";

    const { data } = await axios.get(url, {
        params: {
            origin,
            destination,
            mode: "driving",
            alternatives: false,
            key: process.env.GOOGLE_MAPS_API_KEY,
        },
        timeout: 8000,
    });

    if (!data || data.status !== "OK" || !data.routes || data.routes.length === 0) {
        const arr = new Error(`Google Directions failed: ${data.status || "UNKNOWN"}`);
        arr.code = "DIRECTIONS_ERROR";
        arr.googleStatus = data?.status;
        arr.googleErrorMessage = data?.error_message;
        throw arr;
    }

    const route = data.routes[0];
    const leg = route.legs?.[0];

    if (leg?.distance?.value==null || leg?.duration?.value==null || !route?.overview_polyline?.points) {
        const arr = new Error("Google Directions response missing expected fields");
        arr.code = "DIRECTIONS_BAD_RESPONSE";
        throw arr;
    }

    const distanceKm = Math.round((leg.distance.value / 1000) * 10) / 10;
    const etaMinutes = Math.max(1, Math.round(leg.duration.value / 60));
    const polyline = route.overview_polyline.points;

    return { distanceKm, etaMinutes, polyline };
}

module.exports = { computeDirections };