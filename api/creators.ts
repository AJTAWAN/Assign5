import  express  from "express";
import { mysql,conn,queryAsync } from "../dbconnect";
import { GetCreators } from "../model/creators_model";
export const router = express.Router();

router.get("/",(req,res)=>{
    conn.query('select * from creators',(err,result,fields)=>{
        if(result && result.length > 0){
            res.json(result);
        }
        else{
            res.json({
                success : false,
                Error : "Incorrect Select Movie."
            });
        }
    });
});


router.post("/insert", async (req, res) => {
    let creators: GetCreators = req.body;
    let personIDc : number;
    let sql = mysql.format("select pID from Person where name = ?",[creators.Creator_name])
    let result = await queryAsync(sql);
    let jsonStr =  JSON.stringify(result);
    let jsonobj = JSON.parse(jsonStr);
    let rowData = jsonobj;
    personIDc = rowData[0].pID;

    let movieIDc : number;
    sql = mysql.format("select mID from Movie where title = ?",[creators.Movie_name])
     result = await queryAsync(sql);
     jsonStr =  JSON.stringify(result);
     jsonobj = JSON.parse(jsonStr);
    rowData = jsonobj;
    movieIDc = rowData[0].mID;


    sql = "INSERT INTO `creators`(`movieIDc`, `personIDc`) VALUES (?,?)";
    sql = mysql.format(sql, [
        movieIDc,
        personIDc,
    ]);
    conn.query(sql, (err, result) => {
      if (err) throw err;
      res
        .status(201)
        .json({ affected_row: result.affectedRows, last_idx: result.insertId });
    });
  });


  router.delete("/delete/:person/:movie", async (req, res) => {
    const Person = req.params.person;
    const Movie = req.params.movie;

    let personIDc : number;
    let sql = mysql.format("select pID from Person where name = ?",[Person])
    let result = await queryAsync(sql);
    let jsonStr =  JSON.stringify(result);
    let jsonobj = JSON.parse(jsonStr);
    let rowData = jsonobj;
    personIDc = rowData[0].pID;

    let movieIDc : number;
    sql = mysql.format("select mID from movies where title = ?",[Movie])
    result = await queryAsync(sql);
    jsonStr =  JSON.stringify(result);
    jsonobj = JSON.parse(jsonStr);
    rowData = jsonobj;
    movieIDc = rowData[0].mID;

    conn.query("delete from creators where movieIDc = ? and personIDc = ?", [movieIDc,personIDc], (err, result) => {
        if (err) throw err;
        res
          .status(200)
          .json({ affected_row: result.affectedRows });
     });
  });

  router.delete("/deletebyid/:pID/:mID", (req, res) => {
    let pID = +req.params.pID;
    let mID = +req.params.mID;
    conn.query("delete from creators where movieIDc = ? and personIDc = ?", [mID,pID], (err, result) => {
       if (err) throw err;
       res
         .status(200)
         .json({ affected_row: result.affectedRows });
    });
  });