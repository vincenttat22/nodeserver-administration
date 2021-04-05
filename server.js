const express = require('express');
const cors = require('cors');
const multer = require('multer')
const bodyParser = require('body-parser');
const request = require('request')
const {verifyJWT,querySignIn, querySignUp,renewJwt,queryCheckSignIn} = require('./authentication')
const md5 = require('md5');
const {sendMail} = require('./nodemailer');

const cookieParser = require("cookie-parser");
const app = express()
const port = 3001;


app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(cookieParser());
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});


// respond with "hello world" when a GET request is made to the homepage
app.get('/', function (req, res) {
    res.send('hello world')
})

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'upload')
    },
    filename: function (req, file, cb) {
        console.log(file.originalname);
        cb(null, Date.now() + '-' +file.originalname )
    }
})
const uploadImage = multer({ storage: storage }).single('file')


app.get('/api/checkLogin',verifyJWT, function (req, res) {
    queryCheckSignIn(req,function(out) {
        res.send(out);
    });
})

app.get('/api/sendNow',verifyJWT, function (req, res) {
    sendMail('vincenttat@live.com','test','Content Test').catch(console.error);
    const out = {auth:true,uid:md5(req.userId)};
    res.send(out);
})

app.post('/api/addCuisine',verifyJWT, function (req, res) {
    const out = {auth:true,success:true,error_msg:""};
    uploadImage(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            out.success = false;
            out.error_msg = err;
        } else if (err) {
            out.success = false;
            out.error_msg = err;
        } else {

        }
    })
    res.send(out);
})

app.get('/api/getCuisine',verifyJWT, function (req, res) {
    const cuisine = [{id:"1",price:"20",name:"Lenovo",imgUr:"https://azcd.harveynorman.com.au/media/catalog/product/cache/21/small_image/205x115/9df78eab33525d08d6e5fb8d27136e95/8/1/81vt002rau-lenovo-ideapad-slim-1-laptop-b.jpg",description:"Lenovo Ideapad Slim 1 11.6-inch Celeron-N4020/4GB/64GB eMMC Laptop"}
    ,{id:"2",price:"20",name:"Lenovo",imgUr:"https://azcd.harveynorman.com.au/media/catalog/product/cache/21/small_image/205x115/9df78eab33525d08d6e5fb8d27136e95/8/1/81vt002rau-lenovo-ideapad-slim-1-laptop-b.jpg",description:"Lenovo Ideapad Slim 1 11.6-inch Celeron-N4020/4GB/64GB eMMC Laptop"}
    ,{id:"3",price:"20",name:"Lenovo",imgUr:"https://azcd.harveynorman.com.au/media/catalog/product/cache/21/small_image/205x115/9df78eab33525d08d6e5fb8d27136e95/8/1/81vt002rau-lenovo-ideapad-slim-1-laptop-b.jpg",description:"Lenovo Ideapad Slim 1 11.6-inch Celeron-N4020/4GB/64GB eMMC Laptop"}
    ,{id:"4",price:"20",name:"Lenovo",imgUr:"https://azcd.harveynorman.com.au/media/catalog/product/cache/21/small_image/205x115/9df78eab33525d08d6e5fb8d27136e95/8/1/81vt002rau-lenovo-ideapad-slim-1-laptop-b.jpg",description:"Lenovo Ideapad Slim 1 11.6-inch Celeron-N4020/4GB/64GB eMMC Laptop"}
    ,{id:"5",price:"20",name:"Lenovo",imgUr:"https://azcd.harveynorman.com.au/media/catalog/product/cache/21/small_image/205x115/9df78eab33525d08d6e5fb8d27136e95/8/1/81vt002rau-lenovo-ideapad-slim-1-laptop-b.jpg",description:"Lenovo Ideapad Slim 1 11.6-inch Celeron-N4020/4GB/64GB eMMC Laptop"}
    ,{id:"6",price:"20",name:"Lenovo",imgUr:"https://azcd.harveynorman.com.au/media/catalog/product/cache/21/small_image/205x115/9df78eab33525d08d6e5fb8d27136e95/8/1/81vt002rau-lenovo-ideapad-slim-1-laptop-b.jpg",description:"Lenovo Ideapad Slim 1 11.6-inch Celeron-N4020/4GB/64GB eMMC Laptop"}
    ,{id:"7",price:"20",name:"Lenovo",imgUr:"https://azcd.harveynorman.com.au/media/catalog/product/cache/21/small_image/205x115/9df78eab33525d08d6e5fb8d27136e95/8/1/81vt002rau-lenovo-ideapad-slim-1-laptop-b.jpg",description:"Lenovo Ideapad Slim 1 11.6-inch Celeron-N4020/4GB/64GB eMMC Laptop"}
    ,{id:"8",price:"20",name:"Lenovo",imgUr:"https://azcd.harveynorman.com.au/media/catalog/product/cache/21/small_image/205x115/9df78eab33525d08d6e5fb8d27136e95/8/1/81vt002rau-lenovo-ideapad-slim-1-laptop-b.jpg",description:"Lenovo Ideapad Slim 1 11.6-inch Celeron-N4020/4GB/64GB eMMC Laptop"}
    ,{id:"9",price:"20",name:"Lenovo",imgUr:"https://azcd.harveynorman.com.au/media/catalog/product/cache/21/small_image/205x115/9df78eab33525d08d6e5fb8d27136e95/8/1/81vt002rau-lenovo-ideapad-slim-1-laptop-b.jpg",description:"Lenovo Ideapad Slim 1 11.6-inch Celeron-N4020/4GB/64GB eMMC Laptop"}];
    const out = {auth:true,cuisine:cuisine};
    res.send(out);
})

app.get('/api/logout',verifyJWT, function (req, res) {
    const id = req.userId;
    res.clearCookie("aTcK");
    res.clearCookie("sTc");
    const out = {auth:false};
    res.send(out);
})

users = [{id:1,username:"vincent",first_name:"Vincent",last_name:"Tat",password:"welcome"}]
app.post('/api/processLogin',function (req, res){
    querySignIn(req.body,function (rs){
        if(rs.auth) {
            renewJwt(req,res,rs.userProfile.user_id);
        }
        res.send(rs);
    });
})

app.post('/api/processSignup',function (req, res){
    const secretKey = "6LeinBsUAAAAALvdySziP2MAegUH2ru2g9iuMPNM";
    const verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    // Hitting GET request to the URL, Google will respond with success or error scenario.
    request(verificationUrl,function(error,response,body) {
        body = JSON.parse(body);
        if(body.success !== undefined && !body.success) {
            return res.json({"auth" : false,"msg" : "Failed captcha verification"});
        }
        let promise = new Promise(function(resolve, reject) {
            querySignUp(req.body, function (rs) {
                if(rs.auth) {
                    renewJwt(req,res,rs.userProfile.user_id);
                }
                res.send(rs);
                resolve(rs.result);
            }).then(r  =>{
                // console.log(r);
            })
        });
    });
})
app.listen(port, () => {
    console.log("Server is running!")
});
