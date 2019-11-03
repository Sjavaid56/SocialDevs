const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const {
  check,
  validationResult
} = require('express-validator');

const Profile = require('../../models/Profile')
const User = require('../../models/Users')

//@route    GET api/Profile/me
//@desc     Get current nodemon -L users profie 
//@access   Private 
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({
        msg: 'There is no profile for this user'
      })
    };
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


//@route    Post api/Profile/
//@desc     Create or update user profile 
//@access   Private 

router.post('/', [auth, [
  check('status', 'Status is required').not()
  .isEmpty(),
  check('skills', 'skills is required').not()
  .isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  const {
    company,
    website,
    location,
    bio,
    status,
    githubusername,
    skills,
    youtube,
    facebook,
    twitter,
    instagram,
    linkedin
  } = req.body

  //build profile object 

  const profileFields = {}
  profileFields.user = req.user.id
  if (company) profileFields.company = company;
  if (website) profileFields.website = website;
  if (location) profileFields.location = location;
  if (bio) profileFields.bio = bio;
  if (status) profileFields.status = status;
  if (githubusername) profileFields.githubusername = githubusername;
  if (skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }
  profileFields.social = {}
  if (twitter) profileFields.social.twitter = twitter;
  if (youtube) profileFields.social.youtube = youtube
  if (facebook) profileFields.social.facebook = facebook;
  if (linkedin) profileFields.social.linkedin = linkedin;
  if (instagram) profileFields.social.instagram = instagram;

  try {

    let profile = await Profile.findOne({
      user: req.user.id
    });
    if (profile) {
      // Update 
      profile = await Profile.findOneAndUpdate({
        user: req.user.id
      }, {
        $set: profileFields
      }, {
        new: true
      });

      return res.json(profile);
    }
    //create 
    profile = new Profile(profileFields);

    await profile.save();
    res.json(profile)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sever Error');
  }
});

//@route    GET api/Profile/
//@desc     Get all profiles 
//@access   Public 

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message)
    res.status(500).send('server Error')
  }

});

//@route    GET api/Profile/user/:user_id
//@desc     Get profie by user ID 
//@access   Public 

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);

    if (!profile) return res.status(400).json({
      msg: "Profile not found"
    })

    res.json(profile);
  } catch (err) {
    console.error(err.message)
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        msg: "Profile not found"
      })
    }
    res.status(500).send('server Error')
  }
});


//@route    Deletw api/Profile/user/:user_id
//@desc     Delete profile user and post 
//@access   Private

router.delete('/', auth, async (req, res) => {
  try {

    // @todo - remove 
    // remove profile

    await Profile.findOneAndRemove({
      user: req.user.id
    });
    // Remove user 

    await User.findOneAndRemove({
      _id: req.user.id
    })

    res.json({
      msg: "User deleted"
    });
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
});

// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove user posts
    await Post.deleteMany({
      user: req.user.id
    });
    // Remove profile
    await Profile.findOneAndRemove({
      user: req.user.id
    });
    // Remove user
    await User.findOneAndRemove({
      _id: req.user.id
    });

    res.json({
      msg: 'User deleted'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


//@route    Put api/Profile/experience
//@desc     add an experience 
//@access   Private

router.put("/experience", [auth, [
  check('title', 'Title is required').not().isEmpty(),
  check('company', 'company is required').not().isEmpty(),
  check('from', 'from data is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    })
  }

  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description,
  } = req.body;

  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }

  try {
    const profile = await Profile.findOne({
      user: req.user.id
    });

    profile.experience.unshift(newExp);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error")
  }
})


//@route    Delete api/Profile/experience/:_id
//@desc     Delete profile user and post 
//@access   Private 

// router.delete('/experience/:exp_id', auth, async (req, res) => {
//   try {
//     const profile = await Profile.findOne({
//       user: req.params.user_id
//     });

//     const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

//     profile.experience.splice(removeIndex, 1);

//     await profile.save();

//     res.json(profile)
//   } catch (err) {
//     console.error(err.message)
//     res.status(500).send("Server Error")
//   }
// })

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const foundProfile = await Profile.findOne({
      user: req.user.id
    });
    const expIds = foundProfile.experience.map(exp => exp._id.toString());
    // if i dont add .toString() it returns this weird mongoose coreArray and the ids are somehow objects and it still deletes anyway even if you put /experience/5
    const removeIndex = expIds.indexOf(req.params.exp_id);
    if (removeIndex === -1) {
      return res.status(500).json({
        msg: 'Server error'
      });
    } else {
      // theses console logs helped me figure it out
      console.log('expIds', expIds);
      console.log('typeof expIds', typeof expIds);
      console.log('req.params', req.params);
      console.log('removed', expIds.indexOf(req.params.exp_id));
      foundProfile.experience.splice(removeIndex, 1);
      await foundProfile.save();
      return res.status(200).json(foundProfile);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: 'Server error'
    });
  }
});

//@route    Put api/Profile/education
//@desc     Delete profile user and post 
//@access   Private

router.put("/education", [auth, [
  check('school', 'School is required').not().isEmpty(),
  check('degree', 'Degree is required').not().isEmpty(),
  check('fieldofstudy', 'Field of study is required').not().isEmpty(),
  check('from', 'From data is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    })
  }

  const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description,
  } = req.body;

  const newEdu = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description,
  }

  try {
    const profile = await Profile.findOne({
      user: req.user.id
    });

    profile.education.unshift(newEdu);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error")
  }
})

//@route    Delete api/Profile/education/:_id
//@desc     Delete profile user and post 
//@access   Private 

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    });

    const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json(profile)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})





//@route    GET api/Profile/github/:username
//@desc     get use repos from github 
//@access   Public 


router.get('/github/:username', (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
      method: "GET",
      headers: {
        'user-agent': 'node.js'
      }
    }

    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        res.status(404).json({
          msg: 'No Github profile found'
        })
      }
      res.json(JSON.parse(body));
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error')
  }
})



module.exports = router;