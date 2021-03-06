'use strict';

// DONE TODO: Install and require the NPM Postgres package 'pg' into your server.js, and ensure that it is then listed as a dependency in your package.json
const fs = require('fs');
const pg = require('pg');
const express = require('express');

// REVIEW: Require in body-parser for post requests in our server. If you want to know more about what this does, read the docs!
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();

// DONE TODO: Complete the connection string for the url that will connect to your local postgres database
// Windows and Linux users; You should have retained the user/pw from the pre-work for this course.
// Your url may require that it's composed of additional information including user and password
// const conString = 'postgres://USER:PASSWORD@HOST:PORT/DBNAME';
const conString = 'postgres://localhost:5432/kilovolt';

// DONE TODO: Our pg module has a Client constructor that accepts one argument: the conString we just defined.
//       This is how it knows the URL and, for Windows and Linux users, our username and password for our
//       database when client.connect is called on line 26. Thus, we need to pass our conString into our
//       pg.Client() call.
const client = new pg.Client(conString);

// REVIEW: Use the client object to connect to our DB.
client.connect();


// REVIEW: Install the middleware plugins so that our app is aware and can use the body-parser module
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));


// REVIEW: Routes for requesting HTML resources
app.get('/new', function(request, response) {
  // DONE COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? 
  // #2 & #5
  //Which method of article.js is interacting with this particular piece of `server.js`? 
  //NONE OF THEM!
  //What part of CRUD is being enacted/managed by this particular piece of code?
  // Read
  response.sendFile('new.html', {root: './public'});
});


// REVIEW: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', function(request, response) {
  // DONE COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? 
  // #2, #5, #3, & #4
  //Which method of article.js is interacting with this particular piece of `server.js`? 
  // Article.prototype.updateRecord
  //What part of CRUD is being enacted/managed by this particular piece of code?
  // Read
  client.query('SELECT * FROM articles')
  .then(function(result) {
    response.send(result.rows);
  })
  .catch(function(err) {
    console.error(err)
  })
});

app.post('/articles', function(request, response) {
  // DONE COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? 
  // #2 #3 #4 #5
  // Which method of article.js is interacting with this particular piece of `server.js`? 
  // Article.prototype.insertRecord
  // What part of CRUD is being enacted/managed by this particular piece of code?
  // Create 
  client.query(
    `INSERT INTO
    articles(title, author, "authorUrl", category, "publishedOn", body)
    VALUES ($1, $2, $3, $4, $5, $6);
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body
    ]
  )
  .then(function() {
    response.send('insert complete')
  })
  .catch(function(err) {
    console.error(err);
  });
});

app.put('/articles/:id', function(request, response) {
  // DONE COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code?
  // #2 #3 #4 #5
  // Which method of article.js is interacting with this particular piece of `server.js`? 
  // Article.prototype.updateRecord
  // What part of CRUD is being enacted/managed by this particular piece of code?
  // Update
  client.query(
    `UPDATE articles
    SET
      title=$1, author=$2, "authorUrl"=$3, category=$4, "publishedOn"=$5, body=$6
    WHERE article_id=$7;
    `,
    [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body,
      request.params.id
    ]
  )
  .then(function() {
    response.send('update complete')
  })
  .catch(function(err) {
    console.error(err);
  });
});

app.delete('/articles/:id', function(request, response) {
  // DONE COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? 
  // #2 #3 #4 #5
  // Which method of article.js is interacting with this particular piece of `server.js`? 
  // Article.prototype.deleteRecord
  // What part of CRUD is being enacted/managed by this particular piece of code?
  // DESTROY THINGS
  client.query(
    `DELETE FROM articles WHERE article_id=$1;`,
    [request.params.id]
  )
  .then(function() {
    response.send('Delete complete')
  })
  .catch(function(err) {
    console.error(err);
  });
});

app.delete('/articles', function(request, response) {
  // DONE COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? 
  // #2 #3 #4 #5
  // Which method of article.js is interacting with this particular piece of `server.js`? 
  // Article.truncateTable
  // What part of CRUD is being enacted/managed by this particular piece of code?
  // DESTROY THINGS
  client.query(
    'DELETE FROM articles;'
  )
  .then(function() {
    response.send('Delete complete')
  })
  .catch(function(err) {
    console.error(err);
  });
});

// DONE COMMENT: What is this function invocation doing?
// loadDB() creates a table called "articles" in the database, then populates it using the loadArticles() function.
loadDB();

app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // DONE COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? 
  // 3 & 4
  //Which method of article.js is interacting with this particular piece of `server.js`? 
  // None
  //What part of CRUD is being enacted/managed by this particular piece of code?
  // Create & Read
  client.query('SELECT COUNT(*) FROM articles')
  .then(result => {
    // REVIEW: result.rows is an array of objects that Postgres returns as a response to a query.
    //         If there is nothing on the table, then result.rows[0] will be undefined, which will
    //         make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
    //         Therefore, if there is nothing on the table, line 151 will evaluate to true and
    //         enter into the code block.
    if(!parseInt(result.rows[0].count)) {
      fs.readFile('./public/data/hackerIpsum.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
          client.query(`
            INSERT INTO
            articles(title, author, "authorUrl", category, "publishedOn", body)
            VALUES ($1, $2, $3, $4, $5, $6);
          `,
            [ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body]
          )
        })
      })
    }
  }).catch(function(err){console.error(err)});
}

function loadDB() {
  // DONE COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? 
  // 3 & 4
  //Which method of article.js is interacting with this particular piece of `server.js`?
  // None
  //What part of CRUD is being enacted/managed by this particular piece of code?
  // Create & Read
  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL);`
    )
    .then(function() {
      loadArticles();
    })
    .catch(function(err) {
      console.error(err);
    });
}
