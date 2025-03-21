import { Controller, Body, HttpCode, Post, Get } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookTicketDto } from './dto/book-ticket.dto';
@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }


    // for testing purposes
    @Get()
    async getAllTickets() {
        return await this.bookingsService.getAllTickets()
    }
    @Post()
    @HttpCode(200)
    async bookTicket(@Body() bookTicketDto: BookTicketDto) {
        return await this.bookingsService.bookTicket(bookTicketDto)
    }


}
