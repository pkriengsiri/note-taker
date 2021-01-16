// Includes required modules
const express = require("express");
const fs = require("fs");
var path = require("path");

// Creates an express instance
const app = express();

// Defines the port that you're going to use
const PORT = 8080 || process.env.PORT;

// Listens to that port
app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
});

// Sets up middleware to parse the request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sets the web root to the public folder
app.use(express.static(__dirname + "/public"));

// Defines API routes

// Creates the API route for notes from the db
app.get("/api/notes", function (req, res) {
  // Send the db.json file
  res.sendFile(path.join(__dirname, "/db/db.json"));
});

//   * POST `/api/notes` - Should receive a new note to save on the request body, add it to the `db.json` file, and then return the new note to the client.
app.post("/api/notes", (req, res) => {
  //   console.log(req.body);
  const storedNotes = [];

  fs.readFile("./db/db.json", "utf8", (err, data) => {
    if (err) throw err;

    const dataObject = JSON.parse(data);

    for (let i = 0; i < dataObject.length; i++) {
      const note = {
        title: dataObject[i].title,
        text: dataObject[i].text,
        id: i,
      };
      storedNotes.push(note);
    }

    const newNote = {
      title: req.body.title,
      text: req.body.text,
      id: storedNotes.length,
    };

    storedNotes.push(newNote);

    const newDB = JSON.stringify(storedNotes);

    fs.writeFile("./db/db.json", newDB, (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    });

    res.send("your note has been saved");
  });
});

//   * DELETE `/api/notes/:id` - Should receive a query parameter containing the id of a note to delete. This means you'll need to find a way to give each note a unique `id` when it's saved. In order to delete a note, you'll need to read all notes from the `db.json` file, remove the note with the given `id` property, and then rewrite the notes to the `db.json` file.
app.delete("/api/notes/:id", (req,res) => {
    const noteID = req.params.id;
    console.log(noteID);

    fs.readFile("./db/db.json", "utf8", (err, data) => {
        if (err) throw err;
    
        const dataObject = JSON.parse(data);

        const newData = dataObject.filter(note => note.id !== parseInt(noteID));
    
        const newDB = JSON.stringify(newData);
    
        fs.writeFile("./db/db.json", newDB, (err) => {
          if (err) throw err;
          console.log("The file has been saved!");
        });
    
        res.send("your note has been deleted");
      });
})

// Defines HTML routes

// Creates the route to return the notes.html file
app.get("/notes", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/notes.html"));
});

// Creates the route to return the index.html file
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});



