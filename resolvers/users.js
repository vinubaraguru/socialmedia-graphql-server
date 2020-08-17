const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { SECRET_KEY } = require('../config');
const { UserInputError } = require('apollo-server');
const { validateRegisterInput,validateLoginInput } = require('../utils/validators')

function generateToken(user){
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    },SECRET_KEY,{ expiresIn: '1h'});
}


module.exports ={
    Mutation:{
        async login(_, {username, password}){
            const { valid, errors } = validateLoginInput(username, password);
            if(!valid){
                throw new UserInputError('Errors', {errors})
            }
            const user = await User.findOne({username});
            if(!user){
                errors.general = 'User not found'
                throw new UserInputError('User not found', {errors});
            }

            const match = await bcrypt.compare(password, user.password);
            if(!match){
                errors.general = 'Wrong credentails';
                throw new UserInputError('Wrong credentails', {errors});
            }
            const token = generateToken(user);
            return{
                ...user._doc,
                id: user._id,
                token
            }
        },
        async register(
            _,
            {registerInput:{ username, email, password, confirmPassword } },
            context,
            info
            ){
            
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
            if(!valid){
                throw new UserInputError('Errors', {errors})
            }
            const existuser = await User.findOne({username});
            if(existuser){
                throw new UserInputError('Username is already taken', {
                    errors:{
                        username:'This Username is already taken'
                    }
                })
            }
        
            const newUser = new User({
                email,
                username,
                password : await bcrypt.hash(password,12),
                createdAt : new Date().toISOString()
            });

            const res = await newUser.save();
            const token = generateToken(res)
            console.log(res);
            return{
                ...res._doc,
                id: res._id,
                token
            }
        }
    }
}