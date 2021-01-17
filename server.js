// Includes required modules
const express = require("express");
const fs = require("fs");
var path = require("path");

// Creates an express instance
const app = express();

// Defines the port the application uses
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

//===================
// Defines API routes
//===================

// Creates the API route for getting the stored notes
app.get("/api/notes", function (req, res) {
  // Send the db.json file to the client
  res.sendFile(path.join(__dirname, "/db/db.json"));
});

// Creates the API route for storing a posted note
app.post("/api/notes", (req, res) => {
  // Empty array for storing previous notes plus the new note
  const storedNotes = [];

  // Use fs to read the contents of db.json
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    // Throw an error if there is an error
    if (err) throw err;

    // Parse the db.json contents to be an array of objects
    const parsedDb = JSON.parse(data);

    // Rebuild the array of object and add an unique id property for each item
    for (let i = 0; i < parsedDb.length; i++) {
      // Create a new note object with an ID paramter
      const note = {
        title: parsedDb[i].title,
        text: parsedDb[i].text,
        id: i,
      };
      // Push the new note to the array of notes
      storedNotes.push(note);
    }

    // Store the posted note in a new note object with a unique ID
    const newNote = {
      title: req.body.title,
      text: req.body.text,
      id: storedNotes.length,
    };

    // Add the new note the the array of notes
    storedNotes.push(newNote);

    // Convert the array of notes to JSON
    const newDB = JSON.stringify(storedNotes);

    // Use fs to write the new stringified array to the db.json file
    fs.writeFile("./db/db.json", newDB, (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    });

    // Send a response to resolve the post request
    res.send("your note has been saved");
  });
});

// Creates the API route for deleting notes
app.delete("/api/notes/:id", (req, res) => {
  // Takes the route parameter and stores it as the note ID to be deleted
  const noteID = req.params.id;

  // Uses fs to read db.json which contains existing notes
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    // Throw an error if there is an error
    if (err) throw err;

    // Parse the db.json contents to be an array of objects
    const parsedDb = JSON.parse(data);

    // Create a new array with the note to be deleted filtered out
    const newData = parsedDb.filter((note) => note.id !== parseInt(noteID));

    // Convert the new array back to JSON
    const newDB = JSON.stringify(newData);

    // Use fs to write the new array back to db.json
    fs.writeFile("./db/db.json", newDB, (err) => {
      if (err) throw err;
      // Success message if the file is written
      console.log("The file has been saved!");
    });

    // Send a response to resolve the delete request
    res.send("your note has been deleted");
  });
});

// Creates the API route for editing notes
app.put("/api/notes", (req, res) => {
  const newNote = {
    title: req.body.title,
    text: req.body.text,
    id: req.body.id,
  };

  // Uses fs to read db.json which contains existing notes
  fs.readFile("./db/db.json", "utf8", (err, data) => {
    // Throw an error if there is an error
    if (err) throw err;

    // Parse the db.json contents to be an array of objects
    const parsedDb = JSON.parse(data);

    // Update the object in the array which has the id of the note to edit
    parsedDb.forEach(element => {
      console.log(element.id);
      if(element.id == parseInt(newNote.id)) {
        element.title = newNote.title;
        console.log(element.title);
        element.text = newNote.text;
        console.log(element.text);
      }
    })

    console.log(parsedDb);


    // Convert the new array back to JSON
    // const newDB = JSON.stringify(newData);

    // // Use fs to write the new array back to db.json
    // fs.writeFile("./db/db.json", newDB, (err) => {
    //   if (err) throw err;
    //   // Success message if the file is written
    //   console.log("The file has been saved!");
    // });

    // // Send a response to resolve the delete request
    res.send("your note has been deleted");
  });
});

//====================
// Defines HTML routes
//====================

// Creates the route to return the notes.html file
app.get("/notes", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/notes.html"));
});

// Creates the route to return the index.html file
app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});
