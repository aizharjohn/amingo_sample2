const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const config = require('config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../../models/User');

const fname = config.get('validations.fname');
const lname = config.get('validations.lname');
const emailreq = config.get('validations.emailreq');
const emailvalid = config.get('validations.emailvalid');
const passreq = config.get('validations.passreq');
const passchar = config.get('validations.passchar');
const regUser = config.get('validations.regUser');
const stat500 = config.get('status.stat500');
//jwt
const secretToken = config.get('jwtSecret');

router.post(
    '/',
    [
        //Field Validation
        check('firstname', fname)
            .not()
            .isEmpty(),
        check('lastname', lname)
            .not()
            .isEmpty(),
        check('email', emailreq)
            .not()
            .isEmpty(),
        check('email', emailvalid).isEmail(),
        check('password', passreq)
            .not()
            .isEmpty(),
        check('password', passchar).isLength({
            min: 6
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstname, lastname, email, password, occupation } = req.body;

        try {
            let user = await UserModel.findOne({ email });
            if (user) {
                res.status(400).json({
                    errors: [{ msg: 'User already exists' }]
                });
            }

            const formData = {
                firstname,
                lastname,
                email,
                password,
                occupation
            };

            const theUser = new UserModel(formData);

            //Password Hashing
            const salt = await bcrypt.genSalt(10);
            theUser.password = await bcrypt.hash(password, salt);

            await theUser.save();

            //Return jsonwebtoken
            const payload = {
                theUser: {
                    id: theUser.id
                }
            };

            jwt.sign(
                payload,
                secretToken,
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
            //res.status(200).send(regUser);
        } catch (error) {
            console.error(error.message);
            res.status(500).send(stat500);
        }
    }
);

module.exports = router;
