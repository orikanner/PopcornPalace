import { IsNumber, IsString, IsDateString, IsNotEmpty, Min, IsInt } from 'class-validator';

export class CreateShowtimeDto {
    
    @IsInt({ message: 'Movie ID must be an integer' })
    movieId: number;

    @IsNumber({}, { message: 'Price must be a number' })
    @Min(0.01, { message: 'Price must be greater than 0.01' })
    price: number;

    @IsString({ message: 'Theater must be a string' })
    theater: string;

    @IsDateString({}, { message: 'Start time must be a valid date' })
    startTime: Date;

    @IsDateString({}, { message: 'End time must be a valid date' })
    endTime: Date;
}
