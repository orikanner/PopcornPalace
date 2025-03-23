import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { createMovieDtoMock, updateMovieDtoMock } from '../src/modules/movies/__tests__/mocks/movie-dto.mock';

describe('Movies e2e', () => {
  let app: INestApplication;
  const timestamp = Date.now();  // use timestamp for related tests
  const movieTitle = `Test Movie ${timestamp}`;  // Base movie name

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Create initial movie for update and delete tests
    const createMovieDto = createMovieDtoMock({
      title: movieTitle,
      genre: 'Test genre',
    });

    const response = await request(app.getHttpServer())
      .post('/movies')
      .send(createMovieDto)
      .expect(200);


  });


  describe('Core Flow', () => {

    it('GET /movies/all - should get all movies', async () => {
      await request(app.getHttpServer())
        .get('/movies/all')
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('POST /movies/update/:movieTitle - should update existing movie', async () => {
      const updateData = updateMovieDtoMock({
        rating: 9.0,
        genre: 'Updated Genre'
      });
      await request(app.getHttpServer())
        .post(`/movies/update/${movieTitle}`)
        .send(updateData)
        .expect(200);
    });
  });

  describe('Dto Validation', () => {
    it('POST /movies - should fail with missing required fields', async () => {
      const invalidMovie = {
        genre: 'Test'  // missing required title
      };

      await request(app.getHttpServer())
        .post('/movies')
        .send(invalidMovie)
        .expect(400);
    });
  });

  describe('Business Logic', () => {
    it('POST /movies - should fail with duplicate movie title', async () => {
      const duplicateMovieDto = createMovieDtoMock({
        title: movieTitle
      });
      await request(app.getHttpServer())
        .post('/movies')
        .send(duplicateMovieDto)
        .expect(409);  // conflict
    });
  });

  afterAll(async () => {
    try {
      // clean created movies
      await request(app.getHttpServer())
        .delete(`/movies/${movieTitle}`)
        .expect(200);

    } finally {
      await app.close();
    }
  });
});











































//SKIP DELETEING THIS COMMENT THIS COMMENT IS IMPORTANT FOR THE CODE TO RUN, ori