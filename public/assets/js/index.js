const $noteTitle = $(".note-title");
const $noteText = $(".note-textarea");
const $saveNoteBtn = $(".save-note");
const $newNoteBtn = $(".new-note");
const $noteList = $(".list-container .list-group");
const $saveEditBtn = $("#saveEdit");

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

// A function for getting all notes from the db
const getNotes = () => {
  return $.ajax({
    url: "/api/notes",
    method: "GET",
  });
};

// A function for saving a note to the db
const saveNote = (note) => {
  return $.ajax({
    url: "/api/notes",
    data: note,
    method: "POST",
  });
};

// A function for deleting a note from the db
const deleteNote = (id) => {
  return $.ajax({
    url: "api/notes/" + id,
    method: "DELETE",
  });
};

// A function for editing a note from the db
const editNote = (note) => {
  return $.ajax({
    url: "api/notes/",
    method: "PUT",
    data: note,
  });
};

// If there is an activeNote, display it, otherwise render empty inputs
const renderActiveNote = () => {
  $saveNoteBtn.hide();

  if (activeNote.id >= 0) {
    $noteTitle.attr("readonly", true);
    $noteText.attr("readonly", true);
    $noteTitle.val(activeNote.title);
    $noteText.val(activeNote.text);
  } else {
    $noteTitle.attr("readonly", false);
    $noteText.attr("readonly", false);
    $noteTitle.val("");
    $noteText.val("");
  }
};

// Get the note data from the inputs, save it to the db and update the view
const handleNoteSave = function () {
  const newNote = {
    title: $noteTitle.val(),
    text: $noteText.val(),
  };

  saveNote(newNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Get the note data from the inputs, save it to the db and update the view
const handleEditSave = function () {
  // Saved the edited note in a variable
  const newNote = {
    title: $("#editNoteTitle").val(),
    text: $("#editNoteBody").val(),
    id: $("#editNoteID").text()
  };

  // Set the active note to be the new edited note
  activeNote = newNote;

  // Hide the modal
  $("#editModal").modal("hide");

  editNote(newNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Edit the clicked note
const handleNoteEdit = function (event) {
  // prevents the click listener for the list from being called when the button inside of it is clicked
  event.stopPropagation();

  // Grab the note that was clicked
  activeNote = $(this).parents(".list-group-item").data();

  // Place the note text in the text areas of the modal window
  $("#editNoteTitle").val(activeNote.title);
  $("#editNoteBody").val(activeNote.text);
  $("#editNoteID").text(activeNote.id);
  
  // Show an edit modal window
  $("#editModal").modal("show");
};

// Delete the clicked note
const handleNoteDelete = function (event) {
  // prevents the click listener for the list from being called when the button inside of it is clicked
  event.stopPropagation();

  const note = $(this).parents(".list-group-item").data();

  if (activeNote.id === note.id) {
    activeNote = {};
  }

  deleteNote(note.id).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Sets the activeNote and displays it
const handleNoteView = function () {
  activeNote = $(this).data();
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
const handleNewNoteView = function () {
  activeNote = {};
  renderActiveNote();
};

// If a note's title or text are empty, hide the save button
// Or else show it
const handleRenderSaveBtn = function () {
  if (!$noteTitle.val().trim() || !$noteText.val().trim()) {
    $saveNoteBtn.hide();
  } else {
    $saveNoteBtn.show();
  }
};

// Render's the list of note titles
const renderNoteList = (notes) => {
  $noteList.empty();

  const noteListItems = [];

  // Returns jquery object for li with given text and delete button
  // unless withDeleteButton argument is provided as false
  const create$li = (text, withDeleteButton = true) => {
    const $li = $("<li class='list-group-item'>");
    const $span = $("<span class='list-text'>").text(text);
    $li.append($span);
    const $buttonDiv = $("<span class='m-0 p-0'>");
    $buttonDiv.attr("id","listButtons");

    if (withDeleteButton) {
      const $delBtn = $(
        "<i class='fas fa-trash-alt float-right text-danger delete-note mx-4'>"
      );
      $delBtn.attr("title","Delete this note");
      $buttonDiv.append($delBtn);
      
      const $editBtn = $(
        "<i class='fas fa-edit float-right text-info edit-note'>"
      );
      $editBtn.attr("title","Edit this note");
      $buttonDiv.append($editBtn)
      
      $li.append($buttonDiv);

    }
    return $li;
  };

  if (notes.length === 0) {
    noteListItems.push(create$li("No saved Notes", false));
  }

  notes.forEach((note) => {
    const $li = create$li(note.title).data(note);
    noteListItems.push($li);
  });

  $noteList.append(noteListItems);
};

// Gets notes from the db and renders them to the sidebar
const getAndRenderNotes = () => {
  return getNotes().then(renderNoteList);
};

$saveNoteBtn.on("click", handleNoteSave);
$noteList.on("click", ".list-group-item", handleNoteView);
$newNoteBtn.on("click", handleNewNoteView);
$noteList.on("click", ".delete-note", handleNoteDelete);
$noteList.on("click", ".edit-note", handleNoteEdit);
$saveEditBtn.on("click", handleEditSave);
$noteTitle.on("keyup", handleRenderSaveBtn);
$noteText.on("keyup", handleRenderSaveBtn);

// Gets and renders the initial list of notes
getAndRenderNotes();
