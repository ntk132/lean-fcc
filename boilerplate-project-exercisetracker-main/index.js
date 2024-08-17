const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const ID_LENG = 24;

const ID_LENG = 24;
var users = [];

var excercises = [];

var logs = [];

function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// POST: /api/users
app
  .post("/api/users", function (req, res) {
    if (!users.find((usr) => usr.username === req.body.username)) {
      var id = makeid(ID_LENG);
      users.push({ _id: id, username: req.body.username });
      res.send({ _id: id, username: req.body.username });
    } else {
      res.send({ error: "Username has existed!" });
    }
  })
  // GET: /api/users
  .get("/api/users", function (req, res) {
    res.json(users);
  });

const midwareCheckUser = (req, res, next) => {
  const found = users.find((usr) => usr._id === req.params._id);

  if (found) {
    req.user = found;
    next();
  } else {
    res.send({ error: "Username is not existed!" });
  }
};

// POST: /api/users/:_id/exercises
app.post("/api/users/:_id/exercises", midwareCheckUser, function (req, res) {
  var description = req.body.description;
  var duration = parseInt(req.body.duration);
  if (isNaN(duration)) {
    res.send({ error: "duration must be number." });
  } else {
    var date = req.body.date
      ? new Date(req.body.date).toDateString()
      : new Date(Date.now()).toDateString();
    var leng = excercises.push({
      description: description,
      duration: duration,
      date: date,
      _id: req.params._id,
    });
    res.send({
      ...req.user,
      ...excercises[leng - 1],
    });
  }
});

const compareDates = (d1, d2) => {
  let date1 = new Date(d1).getTime();
  let date2 = new Date(d2).getTime();
  return date1 - date2;
};

// GET: /api/users/:_id/logs
// GET: /api/users/:_id/logs?[from][&to][&limit]
app.get("/api/users/:_id/logs", midwareCheckUser, function (req, res) {
  var user = req.user;
  const {userId, from, to, limit} = req.query;
  var filtered = excercises.filter((excercise) => excercise._id === user._id);
  if (from) {
    filtered = filtered.filter((excercise) => compareDates(excercise.date, from) >= 0);
  }
  if (to) {
    filtered = filtered.filter((excercise) => compareDates(to, excercise.date) >= 0);
  }
  if (limit) {
    filtered = filtered.slice(0, limit);
  }
  filtered = filtered.map((excercise) => {
    return {
      description: excercise.description,
      duration: parseInt(excercise.duration),
      date: excercise.date,
    };
  });
  res.json({
    username: user.username,
    _id: user._id,
    count: filtered.length,
    log: filtered,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
