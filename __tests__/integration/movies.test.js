const mongoose = require('mongoose');
const supertest = require('supertest');

const server = require('../..');

const { Genre } = require('../../models/genre');
const { Movie } = require('../../models/movie');
const { User } = require('../../models/user');

const getPayload = (genreId) => ({
    title: 'Die Hard',
    genre: genreId,
    numberInStock: 10,
    dailyRentalRate: 50,
});

function testNotFound(exec) {
    it('should return 400 if invalid id is passed', async () => {
        const res = await exec({ sendValidId: false });

        expect(res.status).toBe(400);
    });
}

function testInvalidMovieId(exec) {
    it('should return 404 if movie with given id was not found', async () => {
        const res = await exec({ sendNotFoundId: true });

        expect(res.status).toBe(404);
    });
}

function testNotLoggedIn(exec) {
    it('should return 401 if client is not logged in', async () => {
        const res = await exec({ sendToken: false });

        expect(res.status).toBe(401);
    });
}

function testInvalidGenreId(exec) {
    it('should return 400 if invalid genre id is passed', async () => {
        const res = await exec({ sendValidGenre: false });

        expect(res.status).toBe(400);
    });
}

function testNotFoundGenreId(exec) {
    it('should return 400 if not genre is found for the given genre id', async () => {
        const res = await exec({ sendNotFoundGenreId: true });

        expect(res.status).toBe(400);
    });
}

describe('/api/movies', () => {
    let request;

    beforeAll(() => {
        request = supertest(server);
    });

    afterAll(async (done) => {
        server.close();
        await mongoose.connection.close();
        done();
    });

    afterEach(async (done) => {
        await Movie.deleteMany({});
        await Genre.deleteMany({});
        done();
    });

    describe('GET /', () => {
        it('should return all the movies', async () => {
            const genre = await new Genre({ name: 'Action' }).save();
            const movies = [{ ...getPayload(genre.id) }];

            await Movie.insertMany(movies);

            const res = await request.get('/api/movies');

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data.length).toBe(movies.length);
        });
    });

    describe('GET /:id', () => {
        let movie;

        beforeEach(async () => {
            const genre = await new Genre({ name: 'Action' }).save();
            movie = await new Movie({ ...getPayload(genre.id) }).save();
        });

        const exec = (options = {}) => {
            const defaults = {
                sendValidId: true,
                sendNotFoundId: false,
            };
            const parsed = Object.assign({}, defaults, options);

            const values = {
                id: parsed.sendValidId
                    ? parsed.sendNotFoundId
                        ? mongoose.Types.ObjectId()
                        : movie.id
                    : '1',
            };

            return request.get('/api/movies/' + values.id);
        };

        it('should return a movie if valid id is passed', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveProperty('title', movie.title);
        });

        testNotFound(exec);

        testInvalidMovieId(exec);
    });

    describe('POST /', () => {
        let token, payload;

        beforeEach(async () => {
            token = new User({ isAdmin: true }).generateAuthToken();
            const genre = await new Genre({ name: 'Action' }).save();
            payload = getPayload(genre.id);
        });

        const exec = (options = {}) => {
            const defaults = {
                sendToken: true,
                sendValidMovie: true,
                sendValidGenre: true,
                sendNotFoundGenreId: false,
            };
            const parsed = Object.assign({}, defaults, options);

            const values = {
                token: parsed.sendToken ? token : '',
                title: parsed.sendValidMovie ? payload.title : '',
                genre: parsed.sendValidGenre
                    ? parsed.sendNotFoundGenreId
                        ? mongoose.Types.ObjectId()
                        : payload.genre
                    : '1',
            };

            return request
                .post('/api/movies')
                .set('x-auth-token', values.token)
                .send({
                    ...payload,
                    title: values.title,
                    genre: values.genre,
                });
        };

        testNotLoggedIn(exec);

        it('should return 400 if invalid details are passed', async () => {
            const res = await exec({ sendValidMovie: false });

            expect(res.status).toBe(400);
        });

        testInvalidGenreId(exec);

        testNotFoundGenreId(exec);

        it('should save the movie if valid details are passed', async () => {
            await exec();

            const movie = await Movie.find({ title: payload.title });

            expect(movie).not.toBeNull();
        });

        it('should return the movie id if valid details are passed', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('data');
        });
    });

    describe('PUT /:id', () => {
        let token, movie, newTitle, payload;

        beforeEach(async () => {
            token = new User({ isAdmin: true }).generateAuthToken();
            const genre = await new Genre({ name: 'Action' }).save();
            payload = getPayload(genre.id);
            movie = await new Movie({ ...payload }).save();
            newTitle = 'Die Hard 2';
        });

        const exec = (options = {}) => {
            const defaults = {
                sendToken: true,
                sendValidId: true,
                sendNotFoundId: false,
                sendValidMovie: true,
                sendValidGenre: true,
                sendNotFoundGenreId: false,
            };
            const parsed = Object.assign({}, defaults, options);

            const values = {
                id: parsed.sendValidId
                    ? parsed.sendNotFoundId
                        ? mongoose.Types.ObjectId()
                        : movie.id
                    : '1',
                token: parsed.sendToken ? token : '',
                title: parsed.sendValidMovie ? newTitle : '',
                genre: parsed.sendValidGenre
                    ? parsed.sendNotFoundGenreId
                        ? mongoose.Types.ObjectId()
                        : payload.genre
                    : '1',
            };

            return request
                .put('/api/movies/' + values.id)
                .set('x-auth-token', values.token)
                .send({
                    ...payload,
                    title: values.title,
                    genre: values.genre,
                });
        };

        testNotLoggedIn(exec);

        it('should return 400 if invalid details are passed', async () => {
            const res = await exec({ sendValidMovie: false });

            expect(res.status).toBe(400);
        });

        testNotFound(exec);

        testInvalidMovieId(exec);

        testInvalidGenreId(exec);

        testNotFoundGenreId(exec);

        it('should update the movie if valid details and id are passed', async () => {
            await exec();

            const updatedMovie = await Movie.findOne({ _id: movie._id });

            expect(updatedMovie.title).toBe(newTitle);
        });

        it('should return updated movie id if valid details and id are passed', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toBe(movie.id);
        });
    });

    describe('DELETE /:id', () => {
        let movie, token;

        beforeEach(async () => {
            token = new User({ isAdmin: true }).generateAuthToken();
            const genre = await new Genre({ name: 'Action' }).save();
            movie = await new Movie({ ...getPayload(genre.id) }).save();
        });

        const exec = (options = {}) => {
            const defaults = {
                sendToken: true,
                sendValidId: true,
                sendNotFoundId: false,
            };
            const parsed = Object.assign({}, defaults, options);
            const values = {
                id: parsed.sendValidId
                    ? parsed.sendNotFoundId
                        ? mongoose.Types.ObjectId()
                        : movie.id
                    : '1',
                token: parsed.sendToken ? token : '',
            };

            return request
                .delete('/api/movies/' + values.id)
                .set('x-auth-token', values.token);
        };

        testNotLoggedIn(exec);

        testNotFound(exec);

        testInvalidMovieId(exec);

        it('should delete the movie if valid id is passed', async () => {
            await exec();

            const movieInDb = await Movie.findOne({ _id: movie._id });

            expect(movieInDb).toBeNull();
        });

        it('should return removed movie id if valid id is passed', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('data', movie.id);
        });
    });
});
