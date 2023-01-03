const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
app.get("/players/", async (request, response) => {
  let dbquery = `select * from cricket_team`;
  const arr = await db.all(dbquery);
  response.send(arr.map((each) => convertDbObjectToResponseObject(each)));
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  let dbquery = `insert into cricket_team (player_name,jersey_number,role)
    values('${playerName}',${jerseyNumber},'${role}');`;
  const arr = await db.run(dbquery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetailsQuery = `select * from cricket_team where 
  player_id = ${playerId};`;
  const getPlayerDetailsQueryResponse = await db.get(getPlayerDetailsQuery);
  response.send(convertDbObjectToResponseObject(getPlayerDetailsQueryResponse));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const { playerName, jerseyNumber, role } = request.body;
  const getBookQuery = `
    update
      cricket_team
    set
    player_name= '${playerName}',
    jersey_number= ${jerseyNumber},
    role = '${role}'
    WHERE
      player_id = ${playerId};`;
  const book = await db.run(getBookQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
