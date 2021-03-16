const jwt = require('jsonwebtoken');
const {mysql,pool} = require('./dbConnection')

const authSelf = module.exports  = {
    verifyJWT : function (req,res,next) {
        console.log("SSSSS",this)
        let token = req.cookies['aTcK']
        const jwtKey = req.cookies['sTc']
        const out = {auth:false,msg:""}
        if (!token) {
            res.send(out);
        } else {
            jwt.verify(token,jwtKey,(err,decoded) => {
                if(err) {
                    res.send(out);
                } else {
                    const userId = decoded.id;
                    req.userId = userId;
                    //renew cookie Authentication
                    authSelf.renewJwt(req,res,userId);
                    next();
                }
            })
        }
    },
    renewJwt: function (req,res,id) {
        const secretJwt = authSelf.makeid(6);
        const token = jwt.sign({id:id,exp: Math.floor(Date.now() / 1000) + (60 * 60)},secretJwt);
        res.clearCookie();
        res.setHeader('Set-Cookie', ['aTcK='+token+'; HttpOnly; expires='+new Date(new Date().getTime()+3600000).toUTCString(),'sTc='+secretJwt+'; HttpOnly; expires='+new Date(new Date().getTime()+3600000).toUTCString()]);
    },
    makeid: function (length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    },
    querySignIn: function (data,callback) {
        console.log('dirname',__dirname);

        let out = {auth:true,msg:"",sqlError:[],userProfile:{}};
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query("SELECT id,email,first_name,last_name FROM user WHERE email = ? AND password = ?", [data.email,data.password], function (error, results, fields) {
                connection.release();
                if (error) {
                    throw error;
                } else {
                    console.log(results)
                    if (results.length > 0) {
                        const md5 = require('md5');
                        let userProfile = results[0];
                        userProfile.id = md5(userProfile.id)
                        out.userProfile = userProfile;
                    } else {
                        out.auth = false;
                        out.msg = "Wrong email or password.";
                    }
                    callback(out);
                }
            });
        });
    },
    querySignUp: async function  (data,callback) {
        let out = {auth:true,msg:"",sqlError:[],userProfile:{}};
        const connection = await mysql.connection();
        try {
            console.log("at querySignUp...");
            await connection.query("START TRANSACTION");
            let usernameNo = await connection.query("SELECT COUNT (*) FROM user WHERE email = ?", [data.email]);
            if (usernameNo[0]["COUNT (*)"] > 0) {
                out.auth = false;
                out.msg = "Email exists. Please, login an account with your email or use forgot your password.";
                await connection.query("COMMIT");
            } else {
                let userInfo = {
                    email: data.email,
                    password: data.md5Password,
                    first_name: data.first_name,
                    last_name: data.last_name,
                    phone: data.tel,
                    gender: data.gender,
                    dob: data.dob
                };
                await connection.query("INSERT INTO user SET ?", userInfo);
                let getUserInfo = await connection.query("SELECT id,email,first_name,last_name FROM user WHERE email = ?", [data.email]);
                await connection.query("COMMIT");
                let userProfile = getUserInfo[0];
                const md5 = require('md5');
                userProfile.id = md5(userProfile.id)
                out.userProfile = userProfile;
            }
            callback(out);
        } catch (err) {
            await connection.query("ROLLBACK");
            // console.log('ROLLBACK at querySignUp', err);
            out.auth = false;
            out.sqlError.push(err);
            callback(out);
        } finally {
            await connection.release();
        }
    }
}

