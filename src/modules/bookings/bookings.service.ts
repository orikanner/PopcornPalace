import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Repository } from 'typeorm';
import { BookTicketDto } from './dto/book-ticket.dto';

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking)
        private bookingRepository: Repository<Booking>
    ) { }

    async bookTicket(bookTicketDto: BookTicketDto) {
        try {
            const newBooking = this.bookingRepository.create(bookTicketDto)
            return (await this.bookingRepository.save(newBooking)).bookingId;
        } catch (error) {
            if (error.code == 23505) // from postgresql Class 23 — Integrity Constraint Violation
                throw new ConflictException('Seat already booked for this showtime.');
            throw new InternalServerErrorException('Could not book a ticket')
        }
    }

    async getAllTickets() {
        return await this.bookingRepository.find()
    }
}
