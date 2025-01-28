const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require("express-validator");

exports.bookinstance_list = asyncHandler(async (req, res, next) => {
    const allBookInstances = await BookInstance.find({})
        .populate('book')
        .exec();

    res.render("bookinstance_list", { title: 'Book Instance List', bookinstance_list: allBookInstances});
});

exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
    const bookinstance = await BookInstance.findById(req.params.id)
        .populate('book')
        .exec();

    if (bookinstance === null) {
        const err = new Error('Book copy not found');
        err.status = 404;
        return next(err);
    }

    res.render('bookinstance_detail', {
        title: "Book:",
        bookinstance: bookinstance,
    });
  });
  
// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
    const allBooks = await Book.find({}, "title").sort({title:1}).exec();

    res.render('bookinstance_form', {
        title: 'Create BookInstance',
        book_list: allBooks,
    });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    body("book", "Book must be specified")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("imprint", "Imprint must be specified")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("status").escape(),
    body("due_back", "Invalid date")
        .optional({ values: "falsy" })
        .isISO8601()
        .toDate(),
  
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
    
        // Create a BookInstance object with escaped and trimmed data.
        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
        });
    
        if (!errors.isEmpty()) {
            // There are errors.
            // Render form again with sanitized values and error messages.
            const allBooks = await Book.find({}, "title").sort({ title: 1 }).exec();
    
            res.render("bookinstance_form", {
            title: "Create BookInstance",
            book_list: allBooks,
            selected_book: bookInstance.book._id,
            errors: errors.array(),
            bookinstance: bookInstance,
            });
            return;
        } else {
            // Data from form is valid
            await bookInstance.save();
            res.redirect(bookInstance.url);
        }
    }), 
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
    const bookinstance = await BookInstance.findById(req.params.id).exec();

    if (bookinstance === null) {
        res.redirect('/catalog/bookinstances')
    }

    res.render('bookinstance_delete', {
        title: 'Delete BookInstance',
        bookinstance: bookinstance,
    });
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
    await BookInstance.findByIdAndDelete(req.body.bookinstanceid)
    res.redirect('/catalog/bookinstances');
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
    const [bookinstance, allBooks] = await Promise.all([
        BookInstance.findById(req.params.id).populate('book'),
        Book.find({}, 'title').sort({title: 1}).exec(),
    ])

    if (bookinstance === null) {
        const err = new Error("Bookinstance not found");
        err.status = 404;
        return next(err);    
    }

    res.render('bookinstance_form', {
        title: 'Update Bookinstance',
        bookinstance: bookinstance,
        book_list: allBooks,
        selected_book: bookinstance.book._id.toString(),
    });
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
    body("book", "Book must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("imprint", "Imprint must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("status", "Status must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("due_back", "")
        .escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const bookinstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back,
            _id: req.params.id,
        });

        if (!errors.isEmpty()) {
            const [bookinstance, allBooks] = await Promise.all([
                BookInstance.findById(req.params.id).populate('book'),
                Book.find({}, 'title').sort({title: 1}).exec(),
            ])
        
            res.render('bookinstance_form', {
                title: 'Update Bookinstance',
                bookinstance: bookinstance,
                book_list: allBooks,
                selected_book: bookinstance.book._id.toString(),
                errors: errors.array(),
            });
            return;
        } else {
            const updatedBookinstance = await BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {});
            res.redirect(updatedBookinstance.url);
        }
    })
]