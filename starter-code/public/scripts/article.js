'use strict';

function Article (rawDataObj) {
  /* REVIEW: This is a new construct to save all the properties of rawDataObj into our newly
instantiated object. Object.keys is a function that returns an array of all the properties
of an object as strings. forEach is an array method that iterates over and calls a function on
each element of an array.
  We can also set properties on objects with bracket notation instead of dot notation, which
we must do when we don't necessarily know what the property name will be and thus set it as a variable.
  Additionally, what "this" is changes depending on your context - inside a constructor function, like
Article, "this" refers to the newly instantiated object. However, inside the anonymous function we're
passing into forEach as an argument, "this" in 'use strict' mode will be undefined. As a result,
we can pass our instantiated object "this" into forEach as a second argument to preserve context.
  There is a LOT of new behavior going on here! You will get a more in-depth introduction to
array methods like forEach in class 10. Otherwise, you can review object bracket notation and
Object.keys to try and grok what's going on here.*/
  Object.keys(rawDataObj).forEach(function(key) {
    this[key] = rawDataObj[key];
  }, this);
}

Article.all = [];

Article.prototype.toHtml = function() {
  var template = Handlebars.compile($('#article-template').text());

  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';
  this.body = marked(this.body);

  return template(this);
};

// REVIEW: Refactor the parameter to expect the data from the database, rather than a local file.
Article.loadAll = function(rows) {
  rows.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });

  rows.forEach(function(ele) {
    Article.all.push(new Article(ele));
  })
};

Article.fetchAll = function(callback) {
  $.get('/articles')
  .then(
    function(results) {
      // REVIEW: Call loadAll, and pass in the results, then invoke the callback.
      Article.loadAll(results);
      callback();
    }
  ).catch(function(err){console.error(err)});
};


// REVIEW: Take a few minutes and review what each of these new methods do in relation to our server and DB
Article.truncateTable = function(callback) {
  $.ajax({
    url: '/articles',
    method: 'DELETE',
  })
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  }).catch(function(err){console.error(err)});;
};

Article.prototype.insertRecord = function(callback) {
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  }).catch(function(err){console.error(err)});
};

Article.prototype.deleteRecord = function(callback) {
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'DELETE'
  })
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  }).catch(function(err){console.error(err)});;
};

Article.prototype.updateRecord = function(callback) {
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'PUT',
    data: {
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title
    }
  })
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  }).catch(function(err){console.error(err)});;
};
