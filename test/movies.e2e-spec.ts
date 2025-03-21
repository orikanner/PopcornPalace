import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { createMovieDtoMock, updateMovieDtoMock } from '../src/modules/movies/__tests__/mocks/movie-dto.mock';

describe('MoviesController (e2e)', () => {
  let app: INestApplication;
  const timestamp = Date.now();  // Here we will use timestamp for related tests
  const movieTitle = `Test Movie ${timestamp}`;  // Base movie name

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Core Flow', () => {
    it('POST /movies - should create a new movie', () => {
      const createMovieDto = createMovieDtoMock({
        title: movieTitle,
        genre: 'Test genre',
      });

      return request(app.getHttpServer())
        .post('/movies')
        .send(createMovieDto)
        .expect(200);
    });

    it('GET /movies/all - should get all movies', () => {
      return request(app.getHttpServer())
        .get('/movies/all')
        .expect(200)
        .expect('Content-Type', /json/);
    });

    it('POST /movies/update/:movieTitle - should update existing movie', () => {
      const updateData = updateMovieDtoMock({
        rating: 9.0,
        genre: 'Updated Genre'
      });

      return request(app.getHttpServer())
        .post(`/movies/update/${movieTitle}`)
        .send(updateData)
        .expect(200);
    });

    it('DELETE /movies/:movieTitle - should delete movie', () => {
      return request(app.getHttpServer())
        .delete(`/movies/${movieTitle}`)
        .expect(200);
    });
  });

  describe('Dto Validation', () => {
    it('POST /movies - should fail with missing required fields', () => {
      const invalidMovie = {
        genre: 'Test'  // missing required title
      };

      return request(app.getHttpServer())
        .post('/movies')
        .send(invalidMovie)
        .expect(400);
    });
  });

  describe('Business Logic', () => {
    it('POST /movies - should fail with duplicate movie title', async () => {
      const duplicateMovie = createMovieDtoMock({
        title: `Duplicate Movie ${timestamp}`,
      });

      await request(app.getHttpServer())
        .post('/movies')
        .send(duplicateMovie)
        .expect(200);

      await request(app.getHttpServer())
        .post('/movies')
        .send(duplicateMovie)
        .expect(409);  // conflict
      
      await request(app.getHttpServer())
        .delete(`/movies/Duplicate Movie ${timestamp}`)
        .expect(200); // cleanup i didnt create another env
    });
  });
});










































//SKIP DELETEING THIS COMMENT THIS COMMENT IS IMPORTANT FOR THE CODE TO RUN, ori