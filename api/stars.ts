import express from "express";
import {conn, mysql, queryAsync} from "../dbconnect";
import { GetStars } from "../model/stars_model";
export const router = express.Router();

router.get("/",(req,res)=>{
    conn.query('select * from stars',(err,result,fields)=>{
        if(result && result.length > 0){
            res.json(result);
        }
        else{
            res.json({
                success : false,
                Error : "Incorrect Select Stars."
            });
        }
    });
});

router.post("/insert", async (req, res) => {
    let person: GetStars = req.body;
    let personIDs : number;
    let sql = mysql.format("select pID from Person where name = ?",[person.Stars_name])
    let result = await queryAsync(sql);
    let jsonStr =  JSON.stringify(result);
    let jsonobj = JSON.parse(jsonStr);
    let rowData = jsonobj;
    personIDs = rowData[0].pID;

    let movieIDs : number;
    sql = mysql.format("select mID from Movie where title = ?",[person.Movie_name])
     result = await queryAsync(sql);
     jsonStr =  JSON.stringify(result);
     jsonobj = JSON.parse(jsonStr);
    rowData = jsonobj;
    movieIDs = rowData[0].mID;


    sql = "INSERT INTO `stars`(`movieIDs`, `personIDs`) VALUES (?,?)";
    sql = mysql.format(sql, [
        movieIDs,
        personIDs,
    ]);
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
  });

  router.delete("/delete/:person/:movie", async (req, res) => {
    const person = req.params.person;
    const movie = req.params.movie;

    let personIDs : number;
    let sql = mysql.format("select pID from Person where name = ?",[person])
    let result = await queryAsync(sql);
    let jsonStr =  JSON.stringify(result);
    let jsonobj = JSON.parse(jsonStr);
    let rowData = jsonobj;
    personIDs = rowData[0].pID;

    let movieIDs : number;
    sql = mysql.format("select mID from Movie where title = ?",[movie])
    result = await queryAsync(sql);
    jsonStr =  JSON.stringify(result);
    jsonobj = JSON.parse(jsonStr);
    rowData = jsonobj;
    movieIDs = rowData[0].mID;

    conn.query("delete from stars where movieIDs = ? and personIDs = ?", [movieIDs,personIDs], (err, result) => {
        if (err) throw err;
        res
          .status(200)
          .json({ affected_row: result.affectedRows });
     });
  });

  router.delete("/deletebyid/:pID/:mID", (req, res) => {
    let pID = +req.params.pID;
    let mID = +req.params.mID;
    conn.query("delete from stars where movieIDs = ? and personIDs = ?", [mID,pID], (err, result) => {
       if (err) throw err;
       res
         .status(200)
         .json({ affected_row: result.affectedRows });
    });
  });