const mysql = require("mysql");
let dbConfig = {
    host     : '192.168.0.4',
    user     : 'web',
    password : 'rec0rd001',
    database : 'home_server'
};
const pool = mysql.createPool(dbConfig);
const connection = () => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) reject(err);
            console.log("MySQL pool connected: threadId " );
            const query = (sql, binding) => {
                return new Promise((resolve, reject) => {
                    connection.query(sql, binding, (err, result) => {
                        if (err) reject(err);
                        resolve(result);
                    });
                });
            };
            const release = () => {
                return new Promise((resolve, reject) => {
                    if (err) reject(err);
                    console.log("MySQL pool released: threadId ");
                    resolve(connection.release());
                });
            };
            resolve({ query, release });
        });
    });
};
const query = (sql, binding) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, binding, (err, result, fields) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};
module.exports = { pool, connection, query };
