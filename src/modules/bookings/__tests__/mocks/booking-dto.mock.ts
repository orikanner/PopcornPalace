import { BookTicketDto } from "../../dto/book-ticket.dto";

export const createTicketBookingDtoMock = (override = {}): BookTicketDto => ({
    showtimeId: 1,
    seatNumber: 15, 
    userId:"84438967-f68f-4fa0-b620-0f08217e76af",
    ...override
});
