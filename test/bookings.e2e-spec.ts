import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { createMovieDtoMock } from 'src/modules/movies/__tests__/mocks/movie-dto.mock';
import { createTicketBookingDtoMock } from 'src/modules/bookings/__tests__/mocks/booking-dto.mock';
import { createShowtimeDtoMock } from 'src/modules/showtimes/__tests__/mocks/showtime-dto.mock';

describe('BookingsController (e2e)', () => {
    let app: INestApplication;
    const timestamp = Date.now();
    const movieTitle = `Test Movie ${timestamp}`;
    let createdShowtimeId: number;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe());
        await app.init();
    });

    describe('Booking Flow', () => {
        it('should create and book a ticket', async () => {
            // 1. Create a movie
            const movieResponse = await request(app.getHttpServer())
                .post('/movies')
                .send({
                    title: movieTitle,
                    genre: 'Test',
                    duration: 1,
                    rating: 8,
                    releaseYear: 1948
                })
                .expect(200);

            // 2. Create showtime
            const showtimeResponse = await request(app.getHttpServer())
                .post('/showtimes')
                .send({
                    movieId: movieResponse.body.id,
                    price: 15,
                    theater: 'default',
                    startTime: new Date('1948-08-06T09:00:00Z'),
                    endTime: new Date('1948-08-06T09:01:00Z')
                })
                .expect(200);

            createdShowtimeId = showtimeResponse.body.id;

            // 3. Book ticket
            await request(app.getHttpServer())
                .post('/bookings')
                .send({
                    showtimeId: showtimeResponse.body.id,
                    seatNumber: 15,
                    userId: "84438967-f68f-4fa0-b620-0f08217e76af"
                })
                .expect(200);
        });

        it('should fail booking same seat twice', async () => {
            console.error(createdShowtimeId)
            await request(app.getHttpServer())
                .post('/bookings')
                .send({
                    showtimeId: createdShowtimeId,
                    seatNumber: 15,
                    userId: "84438967-f68f-4fa0-b620-0f08217e76af"
                })
                .expect(409);

            await request(app.getHttpServer())
                .delete(`/movies/${movieTitle}`)
                .expect(200);
        });
    });

    describe('Validation Failures', () => {
        it('Should fail with invalid seat number format', () => {
            const invalidBooking = {
                seatNumber: 'A15',  // Should be number
                showtimeId: 1
            };
            return request(app.getHttpServer())
                .post('/bookings')
                .send(invalidBooking)
                .expect(400);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});










































//SKIP DELETEING THIS COMMENT THIS COMMENT IS IMPORTANT FOR THE CODE TO RUN, ori