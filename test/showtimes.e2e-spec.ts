import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Showtimes E2E', () => {
    let app: INestApplication;
    const timestamp = Date.now();
    const movieTitle = `Test Movie ${timestamp}`;
    let createdMovieId: number;
    let createdShowtimeId: number;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
        // Create test movie that all tests will use
        const movieResponse = await request(app.getHttpServer())
            .post('/movies')
            .send({
                title: movieTitle,
                genre: 'Test',
                duration: 85,
                rating: 8,
                releaseYear: 2000
            });
        createdMovieId = movieResponse.body.id;

        // Create initial showtime
        const showtimeResponse = await request(app.getHttpServer())
            .post('/showtimes')
            .send({
                movieId: createdMovieId,
                price: 15,
                theater: 'default',
                startTime: "2024-08-06T10:00:00",
                endTime: "2024-08-06T11:30:00"
            });
        createdShowtimeId = showtimeResponse.body.id;
    });

    describe('Showtime Flow', () => {
       
        it('should reject overlapping showtimes in same theater - shows the importance of excludeSelf', async () => {
            await request(app.getHttpServer())
                .post('/showtimes')
                .send({
                    movieId: createdMovieId,
                    price: 15,
                    theater: 'default',
                    startTime: "2024-08-06T09:00:00",
                    endTime: "2024-08-06T12:30:00"
                })
                .expect(400);
        });

        // COOL CASE
        it('should allow updating showtime timing even if it would overlap with itself', async () => {
            await request(app.getHttpServer())
                .post(`/showtimes/update/${createdShowtimeId}`)
                .send({
                    startTime: "2024-08-06T09:00:00",
                    endTime: "2024-08-06T10:30:00"
                })
                .expect(200);
        });

        it('should reject update with invalid movie ID', async () => {
            const response = await request(app.getHttpServer())
                .post(`/showtimes/update/${createdShowtimeId}`)
                .send({
                    movieId: -200
                });

            // console.log('Response status:', response.status);  actully found a bug with these tests :: Hhh
            // console.log('Response body:', response.body);
            expect(response.status).toBe(404);
        });
    });

    describe('Validation Failures', () => {
        it('should reject invalid date format', async () => {
            const invalidUpdateShowtimeDto = {
                startTime: "abc"
            };
            return request(app.getHttpServer())
                .post('/showtimes/update/showtimeId')
                .send(invalidUpdateShowtimeDto)
                .expect(400);
        });
    });

    afterAll(async () => {
        try {
            await request(app.getHttpServer())
                .delete(`/movies/${movieTitle}`)
                .expect(200);
        } finally {
            await app.close();
        }
    });
});










































//SKIP DELETEING THIS COMMENT THIS COMMENT IS IMPORTANT FOR THE CODE TO RUN, ori