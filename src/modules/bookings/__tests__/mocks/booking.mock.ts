import { Booking } from "../../entities/booking.entity";
import { Showtime } from "src/modules/showtimes/entities/showtime.entity";

export const createBookingMock = (override = {}) : Booking => ({
    bookingId: 'd1a6423b-4469-4b00-8c5f-e3cfc42eacae',
    showtimeId: 1,
    seatNumber: 1, 
    userId: 'a1k6423i-4469-4r00-8k5f-e3cfc42eacaa',
    showtime: {} as Showtime,
    ...override
  });
