const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/Users')
// const Post = require('../../models/Post')
const { check,validationResult } = require('express-validator')

// @route   GET api/profile/me
// @desc    get current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name','avatar'])
        if(!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' })
        }
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

// @route   POST api/profile/
// @desc    create or update user profile
// @access  Private
router.post('/', [ auth, [
    check('university', 'University is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty()
] ], async (req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    // destructure the request
    const {
        university,
        degree,
        location,
        status,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        github,
        facebook,
    } = req.body;

    // Build profile object
    const profileFields = {}
    profileFields.user = req.user.id
    if(university) profileFields.university = university
    if(degree) profileFields.degree = degree
    if(location) profileFields.location = location
    if(status) profileFields.status = status
    if(skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }
    // Build social object
    profileFields.social = {}
    if(youtube) profileFields.social.youtube = youtube
    if(twitter) profileFields.social.twitter = twitter
    if(facebook) profileFields.social.facebook = facebook
    if(github) profileFields.social.github = github
    if(linkedin) profileFields.social.linkedin = linkedin
    if(instagram) profileFields.social.instagram = instagram

    try {
        let profile = await Profile.findOne({ user: req.user.id })
        if(profile) {
            // update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id }, 
                { $set: profileFields },
                { new: true })
            return res.json(profile)
        }
        // create
        profile = new Profile(profileFields)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

// @route   GET api/profile/
// @desc    get all profiles
// @access  Public
router.get('/', async (req,res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar'])
        res.json(profiles)
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

// @route   GET api/profile/user/:user_id
// @desc    get profile by user id
// @access  Public
router.get('/user/:user_id', async (req,res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar'])
        if(!profile){
            return res.status(400).json({ msg: 'There is no profile for this user' })
        }
        res.json(profile)
    } catch (err) {
        if(err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'There is no profile for this user' })
        }
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

// @route   DELETE api/profile/
// @desc    delete profile, user and posts
// @access  Private
router.delete('/', auth, async (req,res) => {
    try {
        // remove user posts
        await Post.deleteMany({ user: req.user.id })
        // remove profile
        await Profile.findOneAndRemove({ user: req.user.id })
        // remove user
        await User.findOneAndRemove({ _id: req.user.id })
        res.json({ msg: 'User deleted' })
    } catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }
})

module.exports = router