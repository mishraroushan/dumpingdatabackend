const User = require('../model/userModel')
const bcrypt = require('bcrypt');
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const file = require("../middleware/aws");
const sendEmail = require('../middleware/emailCtrl');
const { validate } = require("deep-email-validator")

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value != "string") return false;
    return true;
};




const registerAUser = async (req, res) => {
    try {
        const email = req.body.email

        if (!req.body.fullName) {
            return res.status(400).send({ status: false, message: "Please provide Name" })
        }

        if (!req.body.mobile) {
            return res.status(400).send({ status: false, message: "Please provide Mobile" })
        }

        if (!req.body.email) {
            return res.status(400).send({ status: false, message: "Please provide email" })
        }

        if (!req.body.password) {
            return res.status(400).send({ status: false, message: "Please provide password" })
        }

        

        const findUser = await User.findOne({ email: email })
        const usedNuber = await User.findOne({ mobile: req.body.mobile })
        if (usedNuber) {
            return res.status(400).send({ status: false, message: "Mobile already used, try another Number" })
        }

        if (findUser) {
            

            if (findUser?.mobile === req.body.mobile) {
                return res.status(400).send({ message: "Mobile no already exist with this email." })
            }

            if (findUser.email == req.body.email) {
                return res.status(400).send({ message: "Email already exist." })
            }
        }
        else {
            if (!isValid(email)) return res.status(400).send({ status: false, message: "please enter email in string format" })
            if (!/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/.test(email)) return res.status(400).send({ status: false, message: "please enter valid email" })


            let msg = "Thanks , we have appreceate that you have taken time to write us <br/>[Qurinom Solutions]"
            const data = {
                to: req.body.email,
                from: 'qurinomsolution@htmail.in',
                subject: "Registration Success",
                text: "Thanks , we have appreceate that you have taken time to write us <br/>[Qurinom Solutions]",
                html: msg
            }

            sendEmail(data)

            const createUser = await User.create(req.body)



            res.status(201).send({ status: true, message: "User Created Successfully", createUser })
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }

}



const loginUser = async function (req, res) {
    try {
        let { email, password } = req.body;

        if (!isValid(email)) return res.status(400).send({ status: false, message: "please enter email in string format" })
        if (!/[a-z0-9]+@[a-z]+\.[a-z]{2,3}/.test(email)) return res.status(400).send({ status: false, message: "please enter valid email" })

        // if (!isValid(password)) return res.status(400).send({ status: false, message: "please enter password in string format" })
        //     if (!/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,15}$/.test(password)) return res.status(400).send({ status: false, message: "invalid password" })


        let myUser = await User.findOne({ email: email });
        if (!myUser) return res.status(200).send({ status: false, message: "emailId is not present in db" });

        bcrypt.compare(password, myUser.password, function (err, result) {
            if (result) {
                let token = jwt.sign({
                    userId: myUser._id.toString()
                }, "group09",
                    {
                        expiresIn: "10d"
                    });

                res.cookie("token", token, {
                    httpOnly: true,
                    maxAge: 72 * 60 * 60 * 1000
                })

                return res.status(200).send({ status: true, message: "Login successfully", token: token, username: myUser.fullName, email: myUser.email })

            }
            return res.status(200).send({ status: false, message: "wrong password" })

        });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const updatedUser = async (req, res) => {
    try {
        const id = req?.user
        // console.log(id)

        const findUser = await User.findByIdAndUpdate(id, {
            fullName: req.body.fullName,
            email: req.body.email,
            mobile: req.body.mobile,
            profileImage: req.body.profileImage,
            address: req.body.address,
            gender: req.body.gender
        }, {
            new: true
        })
        return res.status(200).send({ status: true, message: "Profile Upsted Succesfully", findUser })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}


const getAlluser = async function (req, res) {

    try {
        let data = await User.find()
        return res.send({ status: true, message: "All User Fetched Succesfully", data })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

const getUser = async function (req, res) {
    try {

        const userId = req.params.userId;
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ msg: "inavalid id format" })
        if (req.user._id != userId) return res.status(403).send({ status: false, message: "you are not authorized" })

        const user = await User.findOne({ _id: userId })

        return res.status(200).send({ status: true, message: "User profile details", data: user });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

const logout = async function (req, res) {
    try {
        const cookie = req.cookies

        if (!cookie.token) return res.status(400).send({ msg: "No refresh token in cookies" })

        res.clearCookie("token", {
            httpOnly: true,
            secure: true
        })
        return res.send({ msg: "logout succesfully" })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }

}












module.exports = { registerAUser, loginUser, getAlluser, updatedUser, getUser, logout }