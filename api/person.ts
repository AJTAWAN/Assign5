import express from "express";
import { conn, mysql } from "../dbconnect";
import { GetPerson } from "../model/person_model";

export const router = express.Router();

router.get("/", (req, res) => {
    conn.query('SELECT * FROM Person', (err, result, fields)=>{
        if (result && result.length > 0) {
            res.json(result);
        } else {
            res.json({
                success: false,
            });
        }
    });
});
router.get("/:name", (req, res) => {
    const nameToSearch = req.params.name;
    let sql = "SELECT FROM `Person` WHERE `name` = ?";
    sql = mysql.format(sql, [nameToSearch]);
    conn.query(sql, (err, result) => {
        if (err) {
            console.error("Error searching for Persons:", err);
            return res.status(500).json({ error: "Error searching for Persons" });
        }
        res.status(200).json(result);
    });
});

router.post("/", (req, res) => {
    let get_person: GetPerson = req.body;
    let sql = "INSERT INTO `Person`(`name`, `birthday`) VALUES (?, ?)";
    sql = mysql.format(sql, [
        get_person.name,
        get_person.birthday,
    ]);
    conn.query(sql, (err, result) => {
        if (err)throw err;
        res.status(200).json({affected_row: result.affectedRows });
    });
});

router.delete("/:name", (req, res) => {
    const nameToDelete = req.params.name;
    let sql = "DELETE FROM `Person` WHERE `name` = ?";
    sql = mysql.format(sql, [nameToDelete]);
        conn.query(sql,(err,result)=>{
            if(err)throw err;
            res.status(200).json({affected_row: result.affectedRows });
        });
});
