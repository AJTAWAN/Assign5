import express, { Request, Response } from "express";
import { conn, mysql, queryAsync } from "../dbconnect";
import { GetStars } from "../model/stars_model";

export const router = express.Router();
router.get("/", (req, res) => {
  const title = req.query.title;
  const sql = `
      SELECT  
          Movie.mID,
          Movie.title AS Movie_title,
          Movie.release_year AS Movie_year,
          Movie.type AS Movie_genre,
          stars.personIDs AS actor_id,
          actor.name AS actor_name,
          actor.birthday AS actor_birthday,
          creators.personIDc AS creator_id,
          creator.name AS creator_name,
          creator.birthday AS creator_birthday
      FROM 
          Movie
          LEFT JOIN stars ON Movie.mID = stars.movieIDs
          LEFT JOIN Person AS actor ON stars.personIDs = actor.pID
          LEFT JOIN creators ON Movie.mID = creators.movieIDc
          LEFT JOIN Person AS creator ON creators.personIDc = creator.pID
      WHERE 
          Movie.title LIKE ?`;

  conn.query(sql, [`%${title}%`], (err, results: any[], fields) => {
    if (err) throw err;

    const moviesMap = new Map<number, any>();

    results.forEach((row: any) => {
        const movieId = row.mID;  

        if (!moviesMap.has(movieId)) {
            moviesMap.set(movieId, {
                Movie_id: row.mID,
                Movie_title: row.Movie_title,
                Movie_year: row.Movie_year,
                Movie_genre: row.Movie_genre,
                actors: [],
                creators: [],
            });
        }

        const movie = moviesMap.get(movieId);

        const actor = {
            actor_id: row.actor_id,
            actor_name: row.actor_name,
            actor_birthday: row.actor_birthday,
        };

        const creator = {
            creator_id: row.creator_id,
            creator_name: row.creator_name,
            creator_birthday: row.creator_birthday,
        };

        if (!movie.actors.find((a: any) => a.actor_id === actor.actor_id)) {
            movie.actors.push(actor);
        }

        if (!movie.creators.find((c: any) => c.creator_id === creator.creator_id)) {
            movie.creators.push(creator);
        }
    });

    const jsonData = { movies: Array.from(moviesMap.values()) };
    res.json(jsonData);
});
});


router.post("/insert", async (req, res) => {
  let person: GetStars = req.body;
  let personID: number;
  let sql = mysql.format("select pID from Person where name = ?", [
    person.Stars_name,
  ]);
  let result = await queryAsync(sql);
  let jsonStr = JSON.stringify(result);
  let jsonobj = JSON.parse(jsonStr);
  let rowData = jsonobj;
  personID = rowData[0].pID;

  let MovieID: number;
  sql = mysql.format("select mID from Movie where title = ?", [
    person.Movie_name,
  ]);
  result = await queryAsync(sql);
  jsonStr = JSON.stringify(result);
  jsonobj = JSON.parse(jsonStr);
  rowData = jsonobj;
  MovieID = rowData[0].mID;

  sql = "INSERT INTO `stars`(`MovieID`, `personID`) VALUES (?,?)";
  sql = mysql.format(sql, [MovieID, personID]);
  conn.query(sql, (err, result) => {
    if (err) throw err;
    res
      .status(201)
      .json({ affected_row: result.affectedRows, last_idx: result.insertId });
  });
});

router.delete("/delete/:Person/:Movie", async (req, res) => {
  const person = req.params.Person;
  const Movie = req.params.Movie;

  let personID: number;
  let sql = mysql.format("select pID from Person where name = ?", [person]);
  let result = await queryAsync(sql);
  let jsonStr = JSON.stringify(result);
  let jsonobj = JSON.parse(jsonStr);
  let rowData = jsonobj;
  personID = rowData[0].pID;

  let MovieID: number;
  sql = mysql.format("select mID from Movie where title = ?", [Movie]);
  result = await queryAsync(sql);
  jsonStr = JSON.stringify(result);
  jsonobj = JSON.parse(jsonStr);
  rowData = jsonobj;
  MovieID = rowData[0].mID;

  conn.query(
    "delete from stars where MovieID = ? and personID = ?",
    [MovieID, personID],
    (err, result) => {
      if (err) throw err;
      res.status(200).json({ affected_row: result.affectedRows });
    }
  );
});

router.delete("/deleteByID/:personID/:MovieID", (req, res) => {
  let personID = +req.params.personID;
  let MovieID = +req.params.MovieID;
  conn.query(
    "delete from stars where MovieID = ? and pID = ?",
    [MovieID, personID],
    (err, result) => {
      if (err) throw err;
      res.status(200).json({ affected_row: result.affectedRows });
    }
  );
});
