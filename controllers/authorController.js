var Author = require('../models/author');
var async = require('async');
var Book = require('../models/book');
var debug = require('debug')('author');

// Display list of all Authors
exports.author_list = function(req, res) {
    Author.find()
        .sort([['family_name', 'ascending']])
        .exec(function (err, list_authors) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('author_list', { title: 'Author List', author_list: list_authors });
        });
};

// Display detail page for a specific Author
exports.author_detail = function(req, res, next) {

    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id)
                .exec(callback);
        },
        authors_books: function(callback) {
            Book.find({ 'author': req.params.id },'title summary')
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('author_detail', { title: 'Author Detail', author: results.author, author_books: results.authors_books });
    });
};

// Display Author create form on GET
exports.author_create_get = function(req, res, next) {
    res.render('author_form', { title: 'Create Author'});
};

// Handle Author create on POST
exports.author_create_post = function(req, res, next) {

    req.checkBody('first_name', 'First name must be specified.').notEmpty();
    //We won't force Alphanumeric, because people might have spaces.
    req.checkBody('family_name', 'Family name must be specified.').notEmpty();
    req.checkBody('family_name', 'Family name must be alphanumeric text.').isAlphanumeric();
    req.checkBody('date_of_birth', 'Invalid date').optional({ checkFalsy: true }).isISO8601();
    req.checkBody('date_of_death', 'Invalid date').optional({ checkFalsy: true }).isISO8601();

    req.sanitize('first_name').escape();
    req.sanitize('family_name').escape();
    req.sanitize('first_name').trim();
    req.sanitize('family_name').trim();

    // check for errors here because below code will modify the value of dates which may cause validation error.
    var errors = req.validationErrors();
    req.sanitize('date_of_birth').toDate();
    req.sanitize('date_of_death').toDate();


    var author = new Author(
        { first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death
        });

    if (errors) {
        res.render('author_form', { title: 'Create Author', author: author, errors: errors});
        return;
    }
    else {
        // Data from form is valid

        author.save(function (err) {
            if (err) { return next(err); }
            //successful - redirect to new author record.
            res.redirect(author.url);
        });
    }

};

// Display Author delete form on GET
exports.author_delete_get = function(req, res, next) {

    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback);
        },
        authors_books: function(callback) {
            Book.find({ 'author': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Successful, so render
        res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
    });

};

// Handle Author delete on POST
exports.author_delete_post = function(req, res, next) {

    req.checkBody('authorid', 'Author id must exist').notEmpty();

    async.parallel({
        author: function(callback) {
            Author.findById(req.body.authorid).exec(callback);
        },
        authors_books: function(callback) {
            Book.find({ 'author': req.body.authorid },'title summary').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        //Success
        if (results.authors_books.length > 0) {
            //Author has books. Render in same way as for GET route.
            res.render('author_delete', { title: 'Delete Author', author: results.author, author_books: results.authors_books } );
            return;
        }
        else {
            //Author has no books. Delete object and redirect to the list of authors.
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if (err) { return next(err); }
                //Success - got to author list
                res.redirect('/catalog/authors');
            });

        }
    });

};

// Display Author update form on GET
exports.author_update_get = function(req, res, next) {

    req.sanitize('id').escape();
    req.sanitize('id').trim();

    async.parallel({
        author: function (callback) {
            Author.findById(req.params.id).populate('author').exec(callback);
        }
    }, function (err, results) {
        if (err) {
            debug('update error:' + err);
            return next(err);
        }

        res.render('author_form', { title: 'Update Author', author: results.author });
    })
};

// Handle Author update on POST
exports.author_update_post = function(req, res, next) {

    //Sanitize id passed in.
    req.sanitize('id').escape();
    req.sanitize('id').trim();

    req.checkBody('first_name', 'First name must be specified.').notEmpty();
    //We won't force Alphanumeric, because people might have spaces.
    req.checkBody('family_name', 'Family name must be specified.').notEmpty();
    req.checkBody('family_name', 'Family name must be alphanumeric text.').isAlphanumeric();
    req.checkBody('date_of_birth', 'Invalid date').optional({ checkFalsy: true }).isISO8601();
    req.checkBody('date_of_death', 'Invalid date').optional({ checkFalsy: true }).isISO8601();

    req.sanitize('first_name').escape();
    req.sanitize('family_name').escape();
    req.sanitize('first_name').trim();
    req.sanitize('family_name').trim();

    // check for errors here because below code will modify the value of dates which may cause validation error.
    var errors = req.validationErrors();
    req.sanitize('date_of_birth').toDate();
    req.sanitize('date_of_death').toDate();

    var author = new Author(
        { first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
            _id:req.params.id //This is required, or a new ID will be assigned!
        });

    if (errors) {
        // Re-render book with error information
        // Get all authors and genres for form
        res.render('author_form', { title: 'Update Author', author: author, errors: errors });
    }
    else {
        // Data from form is valid
        Author.findByIdAndUpdate(req.params.id, author, {}, function (err, theauthor) {
            if (err) { return next(err); }
            //successful - redirect to new author record.
            res.redirect(theauthor.url);
        });
    }

};
