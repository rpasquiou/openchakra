const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const multer = require('multer');
const emptyPromise = require('../../../utils/promise.js');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'static/profile/idCard/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const upload = multer({
    storage: storage
});

const Shop = require('../../models/Shop');
const Prestation = require('../../models/Prestation');
const ServiceUser = require('../../models/ServiceUser');
const validateShopInput = require('../../validation/shop');
router.get('/test', (req, res) => res.json({
    msg: 'Shop Works!'
}));

// FIX import or require
const ALF_CONDS = { // my alfred condiitons
    BASIC: "0",
    PICTURE: "1",
    ID_CARD: "2",
    RECOMMEND: "3",
}

const CANCEL_MODE = {
    FLEXIBLE: "0",
    MODERATE: "1",
    STRICT: "2"
}

// @Route POST /myAlfred/api/shop/add
// Create a shop
// @Access private
// FIX : inclure les disponibilites
router.post('/add', passport.authenticate('jwt', {
    session: false
}), async(req, res) => {

    // FIX: Ajouter date de création de boutique
    console.log('Creating shop');
    const {
        isValid,
        errors
    } = validateShopInput(req.body);

    if (!isValid) {
        console.log("Errors:" + JSON.stringify(errors));
        return res.status(400).json(errors);
    }

    console.log("Shop creation received " + JSON.stringify(req.body, null, 2));
    Shop.findOne({
            alfred: req.user.id
        })
        .then(shop => {
            console.log("Found shop:" + JSON.stringify(shop));
            if (shop === null) {
                shop = new Shop();
                shop.alfred = req.user.id;
            }

            shop.booking_request = req.body.booking_request;
            shop.no_booking_request = !shop.booking_request;
            shop.my_alfred_conditions = req.body.my_alfred_conditions == ALF_CONDS.BASIC;
            shop.profile_picture = req.body.my_alfred_conditions == ALF_CONDS.PICTURE;
            shop.identity_card = req.body.my_alfred_conditions == ALF_CONDS.ID_CARD;
            shop.recommandations = req.body.my_alfred_conditions == ALF_CONDS.RECOMMEND;
            shop.welcome_message = req.body.welcome_message;
            shop.flexible_cancel = req.body.cancel_mode == CANCEL_MODE.FLEXIBLE;
            shop.moderate_cancel = req.body.cancel_mode == CANCEL_MODE.MODERATE;
            shop.strict_cancel = req.body.cancel_mode == CANCEL_MODE.STRICT;
            shop.verified_phone = req.body.verified_phone;
            shop.is_particular = req.body.is_particular;
            shop.is_professional = !shop.is_particular;
            shop.level=req.body.level;

            // FIX: save company
            shop.company = {};
            if (req.body.name) shop.company.name = req.body.name;
            if (req.body.creation_date) shop.company.creation_date = req.body.creation_date;
            if (req.body.siret) shop.company.siret = req.body.siret;
            if (req.body.naf_ape) shop.company.naf_ape = req.body.naf_ape;
            if (req.body.status) shop.company.status = req.body.status;

            shop.picture = "static/shopBanner/sky-690293_1920.jpg";

            console.log("Saving shop:" + JSON.stringify(shop));
            shop.save()
                .then(shop => {
                    su = new ServiceUser();
                    su.user = req.user.id;
                    su.service = req.body.service;
                    su.prestations = []
                    su.equipments = req.body.equipments;
                    su.location = {
                        alfred: false,
                        client: false,
                        visio: false
                    }
                    Object.assign(su.location, req.body.location);
                    su.travel_tax = req.body.travel_tax || 0;
                    su.pick_tax = req.body.pick_tax || 0;
                    su.minimum_basket = req.body.minimum_basket || 0;
                    su.deadline_before_booking = req.body.deadline_value + " " + req.body.deadline_unit;
                    su.description = req.body.description;
                    su.perimeter = req.body.perimeter || 0;
                    su.service_address = req.body.service_address;
                    console.log("Prestas:" + JSON.stringify(req.body.prestations));

                    // FIX : créer les prestations custom avant
                    let newPrestations = Object.values(req.body.prestations).filter(p => p._id == null);
                    console.log("newPrestations:" + JSON.stringify(newPrestations));
                    let newPrestaModels = newPrestations.map(p => Prestation({ ...p, service: req.body.service, billing: [p.billing], filter_presentation: null, private_alfred: req.user.id }));
                    console.log("newPrestationsModel before save:" + JSON.stringify(newPrestaModels));

                    const r = newPrestaModels.length > 0 ? Prestation.collection.insert(newPrestaModels) : emptyPromise({
                        insertedIds: []
                    });
                    r
                        .catch(error => console.log("Error insert many" + JSON.stringify(error, null, 2)))
                        .then(result => {

                            console.log("newPrestationsModel after save:" + JSON.stringify(result));
                            var newIds = result.insertedIds;

                            // Update news prestations ids
                            newPrestations.forEach((p, idx) => {
                                p._id = newIds[idx];
                                console.log("Presta sauvegardée : " + JSON.stringify(p));
                            });

                            Object.values(req.body.prestations).forEach(presta => {
                                console.log("Ajout presta : " + JSON.stringify(presta));
                                p = { prestation: presta._id, billing: presta.billing, price: presta.price };
                                su.prestations.push(p);
                                console.log("Presta ajoutée : " + JSON.stringify(p));
                            });

                            su.save()
                                .then(su => {
                                    console.log("Shop update " + shop._id);
                                    Shop.findOne({
                                            alfred: req.user.id
                                        })
                                        .then(shop => {
                                            shop.services.push(su._id);
                                            shop.save()
                                        });
                                    req.body.availabilities.forEach(availability => {
                                        console.log("Dispo:" + JSON.stringify(availability));
                                        let a = Availability(availability);
                                        a.user = req.user.id;
                                        a.save();
                                    });
                                    User.findOneAndUpdate({
                                            _id: req.user.id
                                        }, {
                                            is_alfred: true
                                        }, {
                                            new: true
                                        })
                                        .then(user => console.log("Updated alfred"))
                                        .catch(err => console.log("Error:" + JSON.stringify(err)))
                                })
                                .catch(err => console.log("Error:" + err))
                            res.json(shop);
                        })
                })
        })
        .catch(err => console.log(err));

});


// @Route GET /myAlfred/api/shop/all
// View all shop
router.get('/all', (req, res) => {

    Shop.find()
        .populate('alfred')
        .populate('services')
        .populate({
            path: 'services',
            populate: {
                path: 'service',
                select: 'label'
            }
        })
        .then(shop => {
            if (typeof shop !== 'undefined' && shop.length > 0) {
                res.json(shop);
            }
            else {
                return res.status(400).json({
                    msg: 'No shop found'
                });
            }


        })
        .catch(err => res.status(404).json({
            shop: 'No shop found'
        }));


});

// @Route GET /myAlfred/api/shop/:id
// View one shop
router.get('/all/:id', (req, res) => {

    Shop.findById(req.params.id)
        .populate('alfred')
        .populate({
            path: 'services.label',
            populate: {
                path: 'service',
                select: 'label'
            }
        })
        .then(shop => {
            if (Object.keys(shop).length === 0 && shop.constructor === Object) {
                return res.status(400).json({
                    msg: 'No shop found'
                });
            }
            res.json(shop);

        })
        .catch(err => res.status(404).json({
            shop: 'No shop found'
        }));


});

// @Route GET /myAlfred/api/shop/alfred/:alfred_id
// Get a shop with alfred id
router.get('/alfred/:id_alfred', (req, res) => {

    Shop.findOne({
            alfred: req.params.id_alfred
        })
        .populate('services')
        .populate('alfred')
        .populate({
            path: 'services',
            populate: {
                path: 'service',
                select: ['label', 'picture']
            }
        })
        .populate({
            path: 'services',
            populate: {
                path: 'service',
                populate: {
                    path: 'category',
                    select: ['label', 'picture']
                }
            }
        })
        .then(shop => {
            if (Object.keys(shop).length === 0 && shop.constructor === Object) {
                return res.status(400).json({
                    msg: 'No shop found'
                });
            }
            res.json(shop);

        })
        .catch(err => res.status(404).json({
            shop: 'No shop found'
        }));


});

// @Route GET /myAlfred/api/shop/currentAlfred
// Get a shop with current alfred id
// @Access private
router.get('/currentAlfred', passport.authenticate('jwt', {
    session: false
}), (req, res) => {

    Shop.findOne({
            alfred: req.user.id
        })
        .populate('alfred')
        .populate({
            path: 'services.label',
            populate: {
                path: 'service',
                select: ['label', 'picture']
            }
        })
        .then(shop => {
            if (Object.keys(shop).length === 0 && shop.constructor === Object) {
                return res.status(400).json({
                    msg: 'No shop found'
                });
            }
            res.json(shop);

        })
        .catch(err => res.status(404).json({
            shop: 'No shop found'
        }));


});

// @Route DELETE /myAlfred/api/shop/current/delete
// Delete one shop
// @Access private
router.delete('/current/delete', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Shop.findOne({
            alfred: req.user.id
        })
        .then(shop => {
            shop.remove().then(() => res.json({
                success: true
            }));
        })
        .catch(err => res.status(404).json({
            shopnotfound: 'No shop found'
        }));
});

// @Route DELETE /myAlfred/api/shop/:id
// Delete one shop
// @Access private
router.delete('/:id', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Shop.findById(req.params.id)
        .then(shop => {
            shop.remove().then(() => res.json({
                success: true
            }));
        })
        .catch(err => res.status(404).json({
            shopnotfound: 'No shop found'
        }));
});


// @Route PUT /myAlfred/api/shop/editBanner
// Edit picture banner for a shop
// @Access private
router.put('/editBanner', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Shop.findOneAndUpdate({
            alfred: req.user.id
        }, {
            picture: req.body.picture
        }, {
            new: true
        })
        .then(shop => {
            res.json(shop)
        })
        .catch(err => {
            console.log(err)
        })
});

// @Route PUT /myAlfred/api/shop/editWelcomeMessage
// Edit welcome message for a shop
// @Access private
router.put('/editWelcomeMessage', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Shop.findOneAndUpdate({
            alfred: req.user.id
        }, {
            welcome_message: req.body.welcome_message
        }, {
            new: true
        })
        .then(shop => {
            res.json(shop)
        })
        .catch(err => {
            console.log(err)
        })
});

// @Route PUT /myAlfred/api/shop/editParameters
// Edit booking parameters for a shop
// @Access private
router.put('/editParameters', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Shop.findOneAndUpdate({
            alfred: req.user.id
        }, {
            booking_request: req.body.booking_request,
            no_booking_request: req.body.no_booking_request,
            my_alfred_conditions: req.body.my_alfred_conditions,
            profile_picture: req.body.profile_picture,
            identity_card: req.body.identity_card,
            recommandations: req.body.recommandations,
            flexible_cancel: req.body.flexible_cancel,
            moderate_cancel: req.body.moderate_cancel,
            strict_cancel: req.body.strict_cancel,
            welcome_message: req.body.welcome_message
        }, {
            new: true
        })
        .then(shop => {
            res.json(shop)
        })
        .catch(err => {
            console.log(err)
        })
});

// @Route PUT /myAlfred/api/shop/editStatus
// Edit personal status for a shop
// @Access private
router.put('/editStatus', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    Shop.findOneAndUpdate({
            alfred: req.user.id
        }, {
            is_particular: req.body.is_particular,
            is_professional: req.body.is_professional,
            "company.name": req.body.name,
            "company.creation_date": req.body.creation_date,
            "company.siret": req.body.siret,
            "company.naf_ape": req.body.naf_ape,
            "company.status": req.body.status
        }, {
            new: true
        })
        .then(shop => {
            res.json(shop)
        })
        .catch(err => {
            console.log(err)
        })
});


module.exports = router;
