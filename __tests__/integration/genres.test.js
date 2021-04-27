const mongoose = require('mongoose');
const supertest = require('supertest');

const server = require('../..');

const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');

function testNotFound(exec) {
  it('should return 400 if invalid id is passed', async () => {
    const res = await exec({ sendValidId: false });

    expect(res.status).toBe(400);
  });
}

function testInvalidGenreId(exec) {
  it('should return 404 if genre with given id was not found', async () => {
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

describe('/api/genres', () => {
  let request;

  beforeAll(() => {
    request = supertest(server);
  });

  afterAll(async () => {
    server.close();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Genre.deleteMany({});
  });

  describe('GET /', () => {
    it('should return all genres', async () => {
      const genres = [{ name: 'Genre 1' }, { name: 'Genre 2' }];

      await Genre.insertMany(genres);

      const res = await request.get('/api/genres');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data.length).toBe(genres.length);
      genres.forEach((genre) =>
        expect(res.body.data.some((g) => g.name === genre.name)).toBeTruthy()
      );
    });
  });

  describe('GET /:id', () => {
    let genre;

    beforeAll(async () => {
      genre = await new Genre({ name: 'Genre 1' }).save();
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
            : genre.id
          : '1',
      };

      return request.get('/api/genres/' + values.id);
    };

    it('should return a genre if valid id is passed', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('name', genre.name);
    });

    testNotFound(exec);

    testInvalidGenreId(exec);
  });

  describe('POST /', () => {
    let token, name;

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      name = 'Genre 1';
    });
    const exec = (options = {}) => {
      const defaults = {
        sendToken: true,
        sendValidGenre: true,
      };
      const parsed = Object.assign({}, defaults, options);

      const values = {
        token: parsed.sendToken ? token : '',
        name: parsed.sendValidGenre ? name : '',
      };

      return request
        .post('/api/genres')
        .set('x-auth-token', values.token)
        .send({ name: values.name });
    };

    testNotLoggedIn(exec);

    it('should return 400 if invalid name is passed', async () => {
      const res = await exec({ sendValidGenre: false });

      expect(res.status).toBe(400);
    });

    it('should save the genre if valid name is passed', async () => {
      await exec();

      const genre = await Genre.find({ name });

      expect(genre).not.toBeNull();
    });

    it('should return the genre id if valid name is passed', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('data');
    });
  });

  describe('PUT /:id', () => {
    let token, genre, newName;

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      genre = await new Genre({ name: 'Genre 1' }).save();
      newName = 'Genre 2';
    });

    const exec = (options = {}) => {
      const defaults = {
        sendToken: true,
        sendValidId: true,
        sendNotFoundId: false,
        sendValidGenre: true,
      };
      const parsed = Object.assign({}, defaults, options);

      const values = {
        id: parsed.sendValidId
          ? parsed.sendNotFoundId
            ? mongoose.Types.ObjectId()
            : genre.id
          : '1',
        token: parsed.sendToken ? token : '',
        name: parsed.sendValidGenre ? newName : '',
      };

      return request
        .put('/api/genres/' + values.id)
        .set('x-auth-token', values.token)
        .send({ name: values.name });
    };

    testNotLoggedIn(exec);

    it('should return 400 if invalid name is passed', async () => {
      const res = await exec({ sendValidGenre: false });

      expect(res.status).toBe(400);
    });

    testNotFound(exec);

    testInvalidGenreId(exec);

    it('should update the genre if valid name and id is passed', async () => {
      await exec();

      const updatedGenre = await Genre.findOne({ _id: genre._id });

      expect(updatedGenre.name).toBe(newName);
    });

    it('should return updated genre id if valid name and id is passed', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toBe(genre.id);
    });
  });

  describe('DELETE /:id', () => {
    let genre, token;

    beforeEach(async () => {
      token = new User({ isAdmin: true }).generateAuthToken();
      genre = await new Genre({ name: 'Genre 1' }).save();
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
            : genre.id
          : '1',
        token: parsed.sendToken ? token : '',
      };

      return request
        .delete('/api/genres/' + values.id)
        .set('x-auth-token', values.token);
    };

    testNotLoggedIn(exec);

    testNotFound(exec);

    testInvalidGenreId(exec);

    it('should delete the genre if valid id is passed', async () => {
      await exec();

      const genreInDb = await Genre.findOne({ _id: genre._id });

      expect(genreInDb).toBeNull();
    });

    it('should return removed genre id if valid id is passed', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('data', genre.id);
    });
  });
});
