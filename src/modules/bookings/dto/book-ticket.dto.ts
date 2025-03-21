import { IsNumber, IsString, Min, IsInt, IsUUID } from 'class-validator';

export class BookTicketDto {

    @IsInt({ message: 'Showtime ID must be an integer' })
    showtimeId: number;

    @IsNumber({}, { message: 'Seat number must be a number' })
    @Min(1, { message: 'Invalid seat number' })
    seatNumber: number;

    @IsUUID('4', { message: 'User ID must be a valid UUID' })
    userId: string;

}
