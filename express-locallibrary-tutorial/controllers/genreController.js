const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find({})
    .exec();

  res.render('genre_list', {title: 'Genre List', genrelist: allGenres});
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const [genre, booksInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({genre: req.params.id}).select('title summary').exec(),
  ]);

  if (genre === null) {
    const err = new Error('Genre not Found');
    err.status = 404;
    return next(err)
  }

  res.render('genre_detail', {title: 'Genre Detail', genre: genre, genre_books: booksInGenre});
});

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render('genre_form', {title: "Create Genre"});
};

// Handle Genre create on POST.
exports.genre_create_post = [

  // 입력된 데이터 유효성, 보안 검사
  body('name', 'Genre name must contain at least 3 characters')
    .trim()
    .isLength({min: 3})
    .escape(),

  // post 핸들러에 전달
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({ name: req.body.name});

    // 입력된 데이터에 에러가 있을 경우
    if (!errors.isEmpty()) {
      // 에러 메시지 전달
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array(),
      });
      return;
    // 입력된 데이터에 에러가 없을 경우
    } else {
      const genreExists = await Genre.findOne({ name: req.body.name})
        .collation({locale: 'en', strength: 2})
        .exec();

      // post하려는 데이터가 이미 존재할 경우
      if (genreExists) {
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        res.redirect(genre.url);
      }
    }
  })
]

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const [genre, allBooksByGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({genre: req.params.id}).select('title summary').exec(),
  ]);

  if (genre === null) {
    res.redirect('/catalog/genres')
  }

  res.render('genre_delete', {
    title: 'Delete Genre',
    genre: genre,
    genre_books: allBooksByGenre,
  });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const [genre, allBooksByGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Book.find({genre: req.params.id}).select('genre title').exec(),
  ])

  // 해당하는 장르의 책이 있다면
  if (allBooksByGenre.length > 0) {
    res.render('genre_delete', {
      title: 'Delete Genre',
      genre: genre,
      genre_books: allBooksByGenre,
    });
    return;
  } else {
    await Genre.findByIdAndDelete(req.body.genreid);
    res.redirect('/catalog/genres');
  }
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();

  if (genre === null) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render('genre_form', {
    title: 'Update Genre',
    genre: genre,
  });
});

// Handle Genre update on POST.
exports.genre_update_post = [
  // 입력된 데이터 유효성, 보안 검사
  body('name', 'Genre name must contain at least 3 characters')
    .trim()
    .isLength({min: 3})
    .escape(),

  // post 핸들러에 전달
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const genre = new Genre({ 
      name: req.body.name,
      _id: req.params.id,
    });

    // 입력된 데이터에 에러가 있을 경우
    if (!errors.isEmpty()) {
      // 에러 메시지 전달
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array(),
      });
      return;
    // 입력된 데이터에 에러가 없을 경우
    } else {
        const updatedGenre = await Genre.findByIdAndUpdate(req.params.id, genre, {});
        res.redirect(updatedGenre.url);
    }
  })
]