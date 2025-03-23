import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { createMovieDtoMock } from 'src/modules/movies/__tests__/mocks/movie-dto.mock';
import { createTicketBookingDtoMock } from 'src/modules/bookings/__tests__/mocks/booking-dto.mock';
import { createShowtimeDtoMock } from 'src/modules/showtimes/__tests__/mocks/showtime-dto.mock';

describe('Bookings e2e', () => {
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
        // Create test movie
        const movieResponse = await request(app.getHttpServer())
            .post('/movies')
            .send({
                title: movieTitle,
                genre: 'Test',
                duration: 1,
                rating: 8,
                releaseYear: 1948
            });
        createdMovieId = movieResponse.body.id;

        // Create test showtime
        const showtimeResponse = await request(app.getHttpServer())
            .post('/showtimes')
            .send({
                movieId: createdMovieId,
                price: 15,
                theater: 'default',
                startTime: new Date('1948-08-06T09:00:00Z'),
                endTime: new Date('1948-08-06T09:01:00Z')
            });
        createdShowtimeId = showtimeResponse.body.id;
        // book a ticket to test conflicts 
        await request(app.getHttpServer())
            .post('/bookings')
            .send({
                showtimeId: createdShowtimeId,
                seatNumber: 15,
                userId: "84438967-f68f-4fa0-b620-0f08217e76af"
            });

    });

    describe('Booking Flow', () => {
        it('should book a ticket', async () => {
            await request(app.getHttpServer())
                .post('/bookings')
                .send({
                    showtimeId: createdShowtimeId,
                    seatNumber: 16,
                    userId: "84438967-f68f-4fa0-b620-0f08217e76af"
                })
                .expect(200);
        });

        it('should fail booking same seat twice', async () => {
            await request(app.getHttpServer())
                .post('/bookings')
                .send({
                    showtimeId: createdShowtimeId,
                    seatNumber: 15,
                    userId: "84438967-f68f-4fa0-b620-0f08217e76af"
                })
                .expect(409);

        });
    });

    describe('Validation Failures', () => {
        it('Should fail with invalid seat number format', async () => {
            const invalidBooking = {
                seatNumber: 'A15',  // Should be number
                showtimeId: 1
            };
            await request(app.getHttpServer())
                .post('/bookings')
                .send(invalidBooking)
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