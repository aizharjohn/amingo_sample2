const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const config = require('config');
const bcrypt = require('bcrypt');
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
    '/register',
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

            //Password Hashing (BCRYPT)
            // bcrypt.genSalt((err, salt) => {
            //     bcrypt.hash(formData.password, salt, (err, hashedPassword) => {
            //         theUser.password = hashedPassword;
            //         // await theUser.save();
            //         theUser.save();
            //     });
            // });

            //BCRYPT
            const hashPassword = async () => {
                await bcrypt.genSalt((err, salt) => {
                    bcrypt.hash(
                        formData.password,
                        salt,
                        (err, hashedPassword) => {
                            theUser.password = hashedPassword;
                            theUser.save();
                        }
                    );
                });
            };

            hashPassword();

            res.send('User registered');

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

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await UserModel.findOne({ email });
        if (user) {
            res.status(400).json({
                errors: [{ msg: 'User already exists' }]
            });
        }

        const formData = {
            email,
            password
        };
    } catch (error) {
        console.error(error.message);
        res.status(500).send(stat500);
    }

    //const theUser = new UserModel(formData);
});

module.exports = router;
