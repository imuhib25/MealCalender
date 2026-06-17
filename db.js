const path = require('path');
const { app } = require('electron');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(app.getPath('userData') || __dirname, 'meals.db');
const db = new sqlite3.Database(dbPath);

function init(){
    db.serialize(()=>{
        db.run(`CREATE TABLE IF NOT EXISTS meals(
            month INTEGER,
            year INTEGER,
            day INTEGER,
            lunch INTEGER,
            dinner INTEGER,
            PRIMARY KEY(month,year,day)
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS costs(
            month INTEGER,
            year INTEGER,
            cost REAL,
            PRIMARY KEY(month,year)
        )`);
    });
}

function getMonth(month, year){
    return new Promise((resolve, reject)=>{
        const stmt = `SELECT day, lunch, dinner FROM meals WHERE month=? AND year=?`;
        db.all(stmt, [month, year], (err, rows)=>{
            if(err) return reject(err);
            const result = {};
            rows.forEach(r=>{ result[r.day] = { lunch: !!r.lunch, dinner: !!r.dinner }; });
            resolve(result);
        });
    });
}

function saveDay(month, year, day, data){
    return new Promise((resolve, reject)=>{
        const stmt = `INSERT OR REPLACE INTO meals(month,year,day,lunch,dinner) VALUES(?,?,?,?,?)`;
        db.run(stmt, [month, year, day, data.lunch?1:0, data.dinner?1:0], function(err){
            if(err) return reject(err);
            resolve();
        });
    });
}

function getCost(month, year){
    return new Promise((resolve, reject)=>{
        const stmt = `SELECT cost FROM costs WHERE month=? AND year=?`;
        db.get(stmt, [month, year], (err, row)=>{
            if(err) return reject(err);
            resolve(row ? row.cost : null);
        });
    });
}

function setCost(month, year, cost){
    return new Promise((resolve, reject)=>{
        const stmt = `INSERT OR REPLACE INTO costs(month,year,cost) VALUES(?,?,?)`;
        db.run(stmt, [month, year, cost], function(err){
            if(err) return reject(err);
            resolve();
        });
    });
}

function clearMonth(month, year){
    return new Promise((resolve, reject)=>{
        const stmt = `DELETE FROM meals WHERE month=? AND year=?`;
        db.run(stmt, [month, year], function(err){
            if(err) return reject(err);
            const stmt2 = `DELETE FROM costs WHERE month=? AND year=?`;
            db.run(stmt2, [month, year], function(err2){
                if(err2) return reject(err2);
                resolve();
            });
        });
    });
}

function deleteDay(month, year, day){
    return new Promise((resolve, reject)=>{
        const stmt = `DELETE FROM meals WHERE month=? AND year=? AND day=?`;
        db.run(stmt, [month, year, day], function(err){
            if(err) return reject(err);
            resolve();
        });
    });
}

function selectWholeMonth(month, year, days){
    return new Promise((resolve, reject)=>{
        const insert = db.prepare(`INSERT OR REPLACE INTO meals(month,year,day,lunch,dinner) VALUES(?,?,?,?,?)`);
        db.serialize(()=>{
            for(let d=1; d<=days; d++){
                insert.run([month,year,d,1,1]);
            }
            insert.finalize((err)=>{
                if(err) return reject(err);
                resolve();
            });
        });
    });
}

function exportCSV(month, year, days){
    return new Promise(async (resolve, reject)=>{
        try{
            const data = await getMonth(month, year);
            let csv = "Date,Lunch,Dinner\n";
            for(let d=1; d<=days; d++){
                const m = data[d] || {};
                csv += `${d},${m.lunch?"Yes":"No"},${m.dinner?"Yes":"No"}\n`;
            }
            resolve(csv);
        }catch(err){ reject(err); }
    });
}

module.exports = { init, getMonth, saveDay, getCost, setCost, clearMonth, selectWholeMonth, exportCSV, deleteDay };
