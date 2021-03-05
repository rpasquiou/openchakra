const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const {is_production, is_validation}=require('../../../config/config');
const {validateCompanyProfile, validateCompanyMember, validateCompanyGroup} = require('../../validation/simpleRegister');
const moment = require('moment');
moment.locale('fr');
const Company = require('../../models/Company');
const User = require('../../models/User');
const Group = require('../../models/Group');
const Service = require('../../models/Service');
const crypto = require('crypto');
const multer = require('multer');
const axios = require('axios');
const {computeUrl} = require('../../../config/config');
const emptyPromise = require('../../../utils/promise');
const {ADMIN, EMPLOYEE} = require('../../../utils/consts')
var _ = require('lodash')
const {mangoApi, addIdIfRequired, addRegistrationProof, createMangoClient,install_hooks} = require('../../../utils/mangopay');


axios.defaults.withCredentials = true;

const storageIdPicture = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'static/profile/');
  },
  filename: function (req, file, cb) {
    let datetimestamp = Date.now();
    let key = crypto.randomBytes(5).toString('hex');
    cb(null, datetimestamp + '_' + key + '_' + file.originalname);
  },
});
const uploadIdPicture = multer({
  storage: storageIdPicture,
  fileFilter: function (req, file, callback) {
    let ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.JPEG' && ext !== '.PDF') {
      return callback(new Error('Only images are allowed'));
    }
    callback(null, true);
  },
});

// Registration proof storage
const storageRegProof = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'static/profile/registrationProof/');
  },
  filename: function (req, file, cb) {
    let datetimestamp = Date.now();
    let key = crypto.randomBytes(5).toString('hex');
    let key2 = crypto.randomBytes(10).toString('hex');
    cb(null, datetimestamp + '_' + key + '_' + key2 + path.extname(file.originalname));

  },
});
const uploadRegProof = multer({
  storage: storageRegProof,
  fileFilter: function (req, file, callback) {
    let ext = path.extname(file.originalname);
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.pdf' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.JPEG' && ext !== '.PDF') {
      return callback(new Error('Error extension'));
    }
    callback(null, true);
  },
});

// @Route PUT /myAlfred/api/companies/profile/billingAddress
// Set the main address in the profile
// @Access private
router.put('/profile/billingAddress', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  Company.findById(req.user.company)
    .then(company => {
      company.billing_address = {};
      company.billing_address.address = req.body.address;
      company.billing_address.zip_code = req.body.zip_code;
      company.billing_address.city = req.body.city;
      company.billing_address.country = req.body.country;
      company.billing_address.gps.lat = req.body.gps.lat;
      company.billing_address.gps.lng = req.body.gps.lng;
      company.save().then(company => res.json(company)).catch(err => console.error(err));

    });
});

// @Route PUT /myAlfred/api/companies/profile/serviceAddress
// Add an other address in the profile
// @Access private
router.put('/profile/serviceAddress', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  Company.findById(req.user.company)
    .then(company => {
      const address = {
        address: req.body.address,
        city: req.body.city,
        zip_code: req.body.zip_code,
        lat: req.body.lat,
        lng: req.body.lng,
        label: req.body.label,
        floor: req.body.floor,
        note: req.body.note,
        phone_address: req.body.phone,
      };
      company.service_address.push(address);


      company.save().then(company => res.json(company)).catch(err => console.error(err));


    });
});

// @Route GET /myAlfred/api/companies/profile/address/:id
// Get service address by id
// @Access private
router.get('/profile/address/:id', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  Company.findById(req.user.company)
    .then(company => {
      const index = req.params.id;
      const address = company.service_address;
      const selected = address.map(item => item.id)
        .indexOf(index);
      const obj = address[selected];
      res.json(obj);
    })
    .catch(err => console.error(err));
});

// @Route PUT /myAlfred/api/companies/profile/address/:id
// Edit service address by id
// @Access private
router.put('/profile/address/:id', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  Company.findById(req.user.company)
    .then(company => {
      const index = company.service_address
        .map(item => item.id)
        .indexOf(req.params.id);
      company.service_address[index].label = req.body.label;
      company.service_address[index].address = req.body.address;
      company.service_address[index].zip_code = req.body.zip_code;
      company.service_address[index].city = req.body.city;
      company.service_address[index].floor = req.body.floor;
      company.service_address[index].note = req.body.note;
      company.service_address[index].phone_address = req.body.phone;
      company.service_address[index].lat = req.body.lat;
      company.service_address[index].lng = req.body.lng;

      company.save().then(address => res.json(address)).catch(err => console.error(err));
    })
    .catch(err => console.error(err));
});

// @Route DELETE /myAlfred/api/companies/profile/address/:id
// Delete service address by id
// @Access private
router.delete('/profile/address/:id', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  Company.findById(req.user.company)
    .then(company => {
      const index = company.service_address
        .map(item => item.id)
        .indexOf(req.params.id);
      company.service_address.splice(index, 1);

      company.save().then(address => res.json(address)).catch(err => console.error(err));
    })
    .catch(err => console.error(err));
});

// @Route PUT /myAlfred/api/companies/profile/picture
// Add a picture profile
// @Access private
router.post('/profile/picture', uploadIdPicture.single('myImage'), passport.authenticate('b2badmin', {session: false}), (req, res) => {
  Company.findByIdAndUpdate(req.company.id, {
    picture: req.file ? req.file.path : '',
  }, {new: true})
    .then(company => {
      res.json(company);
    })
    .catch(err => {
      console.error(err);
    });
});

// @Route PUT /myAlfred/api/companies/profile/pictureLater
// Add a picture profile
// @Access private
router.put('/profile/pictureLater', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  Company.findByIdAndUpdate(req.company.id, {picture: req.body.picture}, {new: true})
    .then(company => {
      res.json(company);
    })
    .catch(err => console.error(err));
});

// @Route POST /myAlfred/api/companies/profile/registrationProof/add
// Add a registration proof
// @Access private
router.post('/profile/registrationProof/add', uploadRegProof.single('registrationProof'), passport.authenticate('b2badmin', {session: false}), (req, res) => {
  Company.findById(req.company.id)
    .then(company => {
      company.registration_proof = req.file.path;
      return company.save();
    })
    .then(company => {
      addRegistrationProof(company);
      res.json(company);
    })
    .catch(err => {
      console.error(err);
    });
});

// @Route DELETE /myAlfred/api/companies/profile/registrationProof
// Deletes a registration proof
// @Access private
router.delete('/profile/registrationProof', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  Company.findById(req.company.id)
    .then(company => {
      company.registration_proof = null;
      return company.save();
    })
    .then(company => {
      res.json(company);
    })
    .catch(err => {
      console.error(err);
    });
});

// @Route GET /myAlfred/api/companies/current
// Get the company for the current logged user
router.get('/current', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  Company.findById(req.user.company)
    .then(company => {
      if (!company) {
        return res.status(400).json({msg: 'No company found'});
      }
      res.json(company);

    })
    .catch(err => {
      console.error(err)
      res.status(404).json({company: 'No company found'
      })});
});

// @Route GET /myAlfred/api/companies/companies/:id
// Get one company
router.get('/companies/:id', (req, res) => {
  Company.findById(req.params.id)
    .then(company => {
      if (!company) {
        return res.status(400).json({msg: 'No company found'});
      }
      res.json(company);

    })
    .catch(err => res.status(404).json({company: 'No company found'}));
});

// @Route PUT /myAlfred/api/companies/groups/:group_id/allowedServices
// Data : service_id
// Put allowed service for current company
router.put('/groups/:group_id/allowedServices', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  const group_id = req.params.group_id
  const service_id = req.body.service_id

  Service.findById(service_id, 'label professional_access')
    .then ( service => {
      if (!service) {
        return res.status(404).json({error : `Service ${service._id} introuvable`})
      }
      if (!service.professional_access) {
        return res.status(400).json({error : `Le service ${service.label} n'est pas destiné aux professionnels`})
      }
      Group.findByIdAndUpdate(group_id, {  $addToSet : { allowed_services : service_id}})
        .then(group => {
          if (!group) {
            return res.status(400).json({msg: 'No group found'});
          }
          res.json(group);

        })
        .catch(err => res.status(404).json({company: 'No group found'}));
    })
    .catch(err => {
      console.error(err)
      res.status(404).json({company: 'No group found'})
    })
});

// @Route DELETE /myAlfred/api/companies/groups/:group_id/allowedServices/:service_id
// Delete allowed service for current company
router.delete('/groups/:group_id/allowedServices/:service_id', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  const group_id = req.params.group_id
  const service_id = req.params.service_id

  Group.findByIdAndUpdate(group_id, {  $pull : { allowed_services : service_id}})
    .then(group => {
      if (!group) {
        return res.status(400).json({msg: 'No group found'});
      }
      res.json(group);

    })
    .catch(err => res.status(404).json({company: 'No group found'}));
});

// @Route PUT /myAlfred/api/companies/alfredViews/:id
// Update number of views for an alfred
router.put('/alfredViews/:id', (req, res) => {
  Company.findByIdAndUpdate(req.params.id, {$inc: {number_of_views: 1}}, {new: true})
    .then(company => {
      if (!company) {
        return res.status(400).json({msg: 'No company found'});
      }
      res.json(company);

    })
    .catch(err => res.status(404).json({company: 'No company found'}));
});

// @Route PUT /myAlfred/api/companies/profile/editProfile
// Edit email, job and phone
// @Access private
router.put('/profile/editProfile', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  const {errors, isValid} = validateCompanyProfile(req.body);
  const companyId = req.user.company;

  Company.findOne({name: req.body.name})
    .then(company => {
      if (company && JSON.stringify(company._id) !== JSON.stringify(companyId)) {
        return res.status(400).json({name: 'Une société de ce nom existe déjà'});
      }
      else if(!isValid){
        return res.status(400).json(errors);
      }
      else {
        Company.findByIdAndUpdate(companyId, {
          name: req.body.name,
          description: req.body.description,
          website: req.body.website,
          activity: req.body.activity,
          size: req.body.size,
          siret: req.body.siret,
          vat_number: req.body.vat_number,
          billing_address: req.body.billing_address,
          vat_subject : req.body.vat_subject
        }, {new: true})
          .then(company => {
            if(company){
              res.json({success: 'Entreprise mise à jour !'});
            }else{
              res.json({error: 'Entreprise introuvable'});
            }
          })
          .catch(err => console.error(err));
      }
    })
    .catch(err => console.error(err));
});

// @Route GET /myAlfred/api/companies/account/rib
// Get comppany RIBs
// @Access private
router.get('/account/rib', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  Company.findById(req.company.id)
    .then(company => {
      company.account = {};
      company.account.name = req.body.name;
      company.account.bank = req.body.bank;
      company.account.bic = req.body.bic;
      company.account.iban = req.body.iban;


      company.save()
        .then(result => res.json(result))
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
});

// @Route PUT /myAlfred/api/companies/account/rib
// Edit rib
// @Access private
router.put('/account/rib', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  Company.findById(req.company.id)
    .then(company => {
      company.account = {};
      company.account.name = req.body.name;
      company.account.bank = req.body.bank;
      company.account.bic = req.body.bic;
      company.account.iban = req.body.iban;


      company.save()
        .then(result => res.json(result))
        .catch(err => console.error(err));
    })
    .catch(err => console.error(err));
});

// @Route POST /myAlfred/api/companies/admin
// Creates an admin for this company
// @Access private
router.post('/members', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  const {errors, isValid} = validateCompanyMember(req.body);
  if (!isValid) {
    return res.status(400).json({error: errors});
  }

  User.findOne({email: req.body.email})
    .then(user => {
      if (user) {
        return res.status(400).json({error: "L'email existe déjà"});
      }
      else {
        const company_id = req.user.company
        const newUser= new User({
          firstname : req.body.firstname,
          name : req.body.name,
          email : req.body.email,
          company : company_id,
          password: crypto.randomBytes(10).toString('hex'),
          roles: _.uniq([EMPLOYEE, req.body.role])
        })
        newUser.save()
          .then( newUser => {
            const group_id = req.body.group_id
            if (group_id) {
              Group.update( {_id : group_id}, { $addToSet : {members : newUser._id}})
                .then( () => {
                  res.json(newUser)
                })
            }
            else {
              res.json(newUser)
            }
          })
          .catch( err => {
            console.error(err)
            res.status(500).json({error: err})
          })
      }
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({error: err})
    });
});

// @Route DELETE /myAlfred/api/companies/admin/:admin_id
// removes admin role for a user
// @Access private
router.delete('/members/:member_id', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  const member_id = req.params.member_id;

  const company_id = req.user.company;
  User.find({company: company_id, roles: { "$in" : [ADMIN]}, _id : { $ne : member_id } })
    .then( users => {
      if (users.length==0) {
        return res.status(400).json({error: 'Il doit rester au moins un administrateur'})
      }
      else {
        User.findByIdAndUpdate(member_id, { $pull : { roles : req.body.role}}, { new : true })
          .then(user => {
            if (!user) {
              return res.status(404).json({error : 'Utilisateur inconnu'})
            }
            return res.json(user)
          })
          .catch(err => {
            console.error(err)
            res.status(500).json({error: err})
          })
      }
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({error: err})
    })
});

// @Route GET /myAlfred/api/companies/users
// Returns all employees from current company
// @Access private
router.get('/members', passport.authenticate('b2badmin', {session: false}), (req, res) => {
  const company_id = req.user.company

  User.find({company : company_id}, 'firstname name email company roles')
    .then (users => {
      res.json(users)
    })
    .catch( err => {
      console.error(err)
      res.status(500).json({error: err})
    })
})

// @Route GET /myAlfred/api/companies/groups
// Gets groups for a company
// @Access private
router.get('/groups', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  const company_id = req.user.company

  Group.find({company : company_id})
    .populate('members', 'firstname name email roles company')
    .populate('allowed_services', 'label')
    .then ( groups => {
      res.json(groups)
    })
    .catch (err => {
      console.error(err)
      res.status(500).json({error: err})
    })
})

// @Route POST /myAlfred/api/companies/groups
// Creates a group for the current company
// @Access private
router.post('/groups', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  const {errors, isValid} = validateCompanyGroup(req.body);
  if (!isValid) {
    return res.status(400).json({error: errors});
  }

  const company_id = req.user.company

  Group.findOne({name : req.body.name, company : company_id})
    .then (group => {
      if (group) {
        res.status(400).json({error : 'Ce groupe existe déjà'})
        return
      }
      Group.create({name : req.body.name, company : company_id})
        .then ( group => { res.json(group) })
        .catch ( err => {
          console.error(err)
          res.status(500).json({error : JSON.stringify(err)})
        })

    })
    .catch( err => {
      console.error(err)
      res.status(500).json({error: err})
    })
})

// @Route PUT /myAlfred/api/companies/groups/:group_id
// Updates a group (name, budget)
// @Access private
router.put('/groups/:group_id', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  const group_id = req.params.group_id

  const {errors, isValid} = validateCompanyGroup(req.body);
  if (!isValid) {
    return res.status(400).json({error: errors});
  }

  Group.findOneAndUpdate({ _id : group_id}, req.body, { new : true})
    .then (group => {
      if (!group) {
        return res.status(404).json({error: 'Groupe introuvable'})
      }
      res.json(group)
    })
    .catch( err => {
      console.error(err)
      res.status(500).json({error: err})
    })
})

// @Route DELETE /myAlfred/api/companies/groups/:group_id
// Deletes a group for the current company
// @Access private
router.delete('/groups/:group_id', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  const company_id = req.user.company

  Group.deleteOne({_id : req.params.group_id})
    .then (result => {
      if (result.deletedCount == 0) {
        res.status(404).json({error : `Le groupe ${req.params.group_id} n'existe pas`})
      }
      else {
        res.json(`Groupe ${req.params.group_id} supprimé`)
      }
    })
    .catch( err => {
      console.error(err)
      res.status(500).json({error: err})
    })
})

// @Route PUT /myAlfred/api/companies/groups/:group_id/member
// Adds a member into a group for the current company
// @Access private
router.put('/groups/:group_id/member', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  const company_id = req.user.company
  const group_id = req.params.group_id
  const member_id = req.body.member_id

  User.findById(member_id)
    .then( user => {
      if (!user) {
        res.status(404).json({error: `User ${user_id} introuvable`})
        return
      }
      if (user.company && (user.company.toString() != company_id.toString())) {
        res.status(404).json({error: `User ${user_id} ne fait pas partie de cette compagnie`})
        return
      }
      Group.update( {_id : group_id}, { $addToSet : {members : member_id}})
        .then ( group => {
          res.json(group)
        })
        .catch ( err => {
          console.error(err)
          res.status(500).json({error: JSON.stringify(err)})
        })
    })
    .catch ( err => {
      console.error(err)
      res.status(500).json({error: JSON.stringify(err)})
    })

})

// @Route PUT /myAlfred/api/companies/groups/:group_id/member
// Adds a member into a group for the current company
// @Access private
router.delete('/groups/:group_id/member/:member_id', passport.authenticate('b2badmin', {session: false}), (req, res) => {

  const company_id = req.user.company
  const group_id = req.params.group_id
  const member_id = req.params.member_id

  Group.update( {_id : group_id}, { $pull : { members : member_id}})
    .then ( group => {
      res.json(group)
    })
    .catch ( err => {
      console.error(err)
      res.status(500).json({error: JSON.stringify(err)})
    })
})

module.exports = router;
