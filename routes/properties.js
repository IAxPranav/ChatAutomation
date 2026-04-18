// ============================================
// routes/properties.js  –  Property CRUD API
// ============================================
const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, '../data/properties.json');

// ── Helpers ───────────────────────────────────
function readProps()      { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
function writeProps(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }

// ── GET /api/properties ───────────────────────
// Query params: type, bhk, city, area, minPrice, maxPrice, available
router.get('/', (req, res) => {
  try {
    let props = readProps();
    const { type, bhk, city, minPrice, maxPrice, available } = req.query;

    if (type)      props = props.filter(p => p.type === type);
    if (bhk)       props = props.filter(p => p.bhk  === parseInt(bhk));
    if (city)      props = props.filter(p => p.location.city.toLowerCase().includes(city.toLowerCase()));
    if (available) props = props.filter(p => p.available === (available === 'true'));

    if (minPrice || maxPrice) {
      props = props.filter(p => {
        const price = p.type === 'rent' ? p.rent : p.price;
        if (!price) return false;
        if (minPrice && price < parseInt(minPrice)) return false;
        if (maxPrice && price > parseInt(maxPrice)) return false;
        return true;
      });
    }

    res.json({ count: props.length, properties: props });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/properties/:id ───────────────────
router.get('/:id', (req, res) => {
  try {
    const props = readProps();
    const prop  = props.find(p => p.id === req.params.id);
    if (!prop) return res.status(404).json({ error: 'Property not found' });
    res.json(prop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/properties ──────────────────────
router.post('/', (req, res) => {
  try {
    const props   = readProps();
    const newProp = {
      id:           'PROP' + String(Date.now()).slice(-6),
      title:        req.body.title        || 'Untitled Property',
      type:         req.body.type         || 'sale',
      bhk:          parseInt(req.body.bhk) || 2,
      location: {
        city:    req.body.city    || 'Mumbai',
        area:    req.body.area    || '',
        address: req.body.address || ''
      },
      price:        req.body.type === 'sale' ? (parseInt(req.body.price) || null) : null,
      priceDisplay: req.body.type === 'sale' ? (req.body.priceDisplay || null) : null,
      rent:         req.body.type === 'rent' ? (parseInt(req.body.rent)  || null) : null,
      rentDisplay:  req.body.type === 'rent' ? (req.body.rentDisplay  || null) : null,
      area:         parseInt(req.body.area_sqft) || 0,
      amenities:    req.body.amenities
                      ? req.body.amenities.split(',').map(a => a.trim())
                      : [],
      landmarks:    req.body.landmarks
                      ? req.body.landmarks.split(',').map(l => l.trim())
                      : [],
      image:        req.body.image  || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
      images:       [req.body.image || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'],
      available:    req.body.available !== 'false',
      description:  req.body.description || '',
      floor:        req.body.floor        || '',
      totalFloors:  parseInt(req.body.totalFloors) || null,
      age:          req.body.age          || 'New Construction',
      facing:       req.body.facing       || '',
      possession:   req.body.possession   || 'Ready to Move',
      badge:        req.body.badge        || '✅ Available'
    };

    props.push(newProp);
    writeProps(props);
    res.status(201).json({ message: 'Property added!', property: newProp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/properties/:id ───────────────────
router.put('/:id', (req, res) => {
  try {
    const props = readProps();
    const idx   = props.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Property not found' });

    // Merge update
    const updated = {
      ...props[idx],
      ...req.body,
      location: {
        ...props[idx].location,
        ...(req.body.location || {
          city:    req.body.city    || props[idx].location.city,
          area:    req.body.area    || props[idx].location.area,
          address: req.body.address || props[idx].location.address
        })
      },
      id: props[idx].id  // never change ID
    };

    props[idx] = updated;
    writeProps(props);
    res.json({ message: 'Property updated!', property: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/properties/:id ────────────────
router.delete('/:id', (req, res) => {
  try {
    const props   = readProps();
    const filtered = props.filter(p => p.id !== req.params.id);
    if (filtered.length === props.length)
      return res.status(404).json({ error: 'Property not found' });

    writeProps(filtered);
    res.json({ message: 'Property deleted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
