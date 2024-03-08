import express from "express";
import { conn, mysql } from "../dbconnect";
import { GetMovie } from "../model/movie_model";

export const router = express.Router();

router.get("/", (req, res) => {
    conn.query('SELECT * FROM Movie', (err, result, fields)=>{
        if (result && result.length > 0) {
            res.json(result);
        } else {
            res.json({
                success: false,
            });
        }
    });
  });
router.get("/:title", (req, res) => {
    const titleToSearch = req.params.title;
    let sql = "SELECT * FROM `Movie` WHERE `title` LIKE ?";
    sql = mysql.format(sql, [`%${titleToSearch}%`]);
    conn.query(sql, (err, result) => {
        if (err) {
            console.error("Error searching for movie:", err);
            return res.status(500).json({ error: "Error searching for movie" });
        }
        res.status(200).json(result);
    });
});


router.post("/", (req, res) => {
    let get_movie : GetMovie = req.body;
    let sql = "INSERT INTO `Movie`(`title`, `image`, `release_year`,`type`) VALUES (?,?,?,?)";
        sql = mysql.format(sql,[
            get_movie.title,
            get_movie.image,
            get_movie.release_year,
            get_movie.type,
        ]);
        conn.query(sql,(err,result)=>{
            if(err)throw err;
            res.status(200).json({affected_row: result.affectedRows });
        });
});
router.delete("/:title", (req, res) => {
    const titleToDelete = req.params.title;
    let sql = "DELETE FROM `Movie` WHERE `title` = ?";
    sql = mysql.format(sql, [titleToDelete]);
        conn.query(sql,(err,result)=>{
            if(err)throw err;
            res.status(200).json({affected_row: result.affectedRows });
        });
});
