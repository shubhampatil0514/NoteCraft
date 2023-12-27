const express = require('express');
const userController= require('../controllers/userController')
const router = express.Router();
const multer = require('multer');

//To store profile picture
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/profile');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

router.post('/create' ,upload.single('profilePicture'), userController.register);
router.post('/login', userController.login);
router.get('/:userId',userController.profile);



module.exports = router;