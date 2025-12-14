var mongoose = require('mongoose');
var Venue = mongoose.model("venue");

const createResponse = function (res, status, content) {
  res.status(status).json(content);
};

// GET /api/venues?lng=...&lat=...&maxDistance=...
// (lng yerine long da kabul)
const listVenues = function (req, res) {
  const lat = parseFloat(req.query.lat);
  const lng = parseFloat(req.query.lng ?? req.query.long);

  // MongoDB $geoNear maxDistance => metre
  const maxDistance = parseFloat(req.query.maxDistance) || 20000; // 20km default

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return createResponse(res, 400, { message: "lng (veya long) ve lat zorunlu" });
  }

  const point = { type: "Point", coordinates: [lng, lat] }; // ✅ [lng, lat]

  const geoOptions = {
    distanceField: "distance",
    spherical: true,
    maxDistance: maxDistance
  };

  Venue.aggregate([
    {
      $geoNear: {
        near: point,
        ...geoOptions
      }
    }
  ])
    .then((result) => {
      const venues = result.map(function (venue) {
        return {
          distance: venue.distance, // metre
          name: venue.name,
          address: venue.address,
          rating: venue.rating,
          foodanddrink: venue.foodanddrink,
          id: venue._id
        };
      });

      if (venues.length > 0) createResponse(res, 200, venues);
      else createResponse(res, 200, { status: "Civarda mekan yok" });
    })
    .catch((err) => createResponse(res, 500, err));
};

// POST /api/venues
// Body: { name, address, lng(or long), lat, foodanddrink, rating }
const addVenue = async function (req, res) {
  try {
    const lat = parseFloat(req.body.lat);
    const lng = parseFloat(req.body.lng ?? req.body.long);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return createResponse(res, 400, { message: "Body içinde lng/long ve lat zorunlu" });
    }

    const venue = await Venue.create({
      name: req.body.name,
      address: req.body.address,
      rating: req.body.rating || 0,
      foodanddrink: req.body.foodanddrink || [],
      coordinates: [lng, lat] // ✅ [lng, lat]
    });

    return createResponse(res, 201, venue);
  } catch (err) {
    return createResponse(res, 500, err);
  }
};

const getVenue = async function (req, res) {
  try {
    await Venue.findById(req.params.venueid).exec().then(function (venue) {
      createResponse(res, 200, venue);
    });
  }
  catch (err) {
    createResponse(res, 404, { status: "böyle bir mekan yok" });
  }
};

const updateVenue = function (req, res) {
  createResponse(res, 200, { status: "update başarılı" });
};

const deleteVenue = function (req, res) {
  createResponse(res, 200, { status: "başarılı" });
};

module.exports = {
  listVenues,
  addVenue,
  getVenue,
  updateVenue,
  deleteVenue
};
