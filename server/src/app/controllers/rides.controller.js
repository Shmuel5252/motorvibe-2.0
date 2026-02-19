const mongoose = require("mongoose");
const { validationResult } = require("express-validator");

const Ride = require("../models/Ride");
const Route = require("../models/Route");


function notFound(res) {
    return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Not found" }
    });
}

async function startRide(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: { 
                code: "VALIDATION_ERROR", 
                details: errors.array() }
    });
    }

    const owner = req.user.userId;
    const { routeId } = req.body;

    if (!mongoose.isValidObjectId(routeId)) {
        return notFound(res);
    }

    const active = await Ride.findOne({ owner, endedAt: null });
    if (active) {
        return res.status(409).json({
            error: { code: "ACTIVE_RIDE_EXISTS", message: "You already have an active ride" }
        });
    }

    const route = await Route.findOne({ _id: routeId, owner });
    if (!route) {
        return notFound(res);
    }

    const ride = await Ride.create({ 
        owner, 
        route: route._id, 

        routeSnapshot: {
            title: route.title,
            start: route.start,
            end: route.end,
            distanceKm: route.distanceKm,
            etaMinutes: route.etaMinutes,
            polyline: route.polyline,
        },
        startedAt: new Date(),
        endedAt: null,
        durationSeconds: null,
     });
    return res.status(201).json({ ride });
}

async function stopRide(req, res) {
    const owner = req.user.userId;

    const ride = await Ride.findOne({ owner, endedAt: null }).sort({ startedAt: -1 });
    if (!ride) {
        return res.status(409).json({
            error: { code: "NO_ACTIVE_RIDE", message: "No active ride to stop"  }
        });
    }

    const endedAt = new Date();
    const durationSeconds = Math.max(
        0, 
        Math.floor((endedAt.getTime() - ride.startedAt.getTime()) / 1000));

    ride.endedAt = endedAt;
    ride.durationSeconds = durationSeconds;
    await ride.save();

        return res.status(200).json({ ride });
}

async function getActiveRide(req, res) {
    const owner = req.user.userId;

    const ride = await Ride.findOne({ owner, endedAt: null })
    .sort({ startedAt: -1 });

    return res.status(200).json({ ride: ride || null });
}

async function getRideHistory(req, res) {
    const owner = req.user.userId;

    const rides = await Ride.find({ owner, endedAt: { $ne: null } })
    .sort({ startedAt: -1 })
    .limit(50);

    return res.status(200).json({ rides });
}

module.exports = {
    startRide,
    stopRide,
    getActiveRide,
    getRideHistory,
};