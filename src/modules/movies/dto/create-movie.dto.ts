import { IsString, IsInt, IsNumber, Min, Max } from 'class-validator';

export class CreateMovieDto {
  @IsString({ message: 'Title must be a string' })
  title: string;

  @IsString({ message: 'Genre must be a string' })
  genre: string;

  @IsInt({ message: 'Duration must be a number' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  duration: number;

  @IsNumber({}, { message: 'Rating must be a number' })
  @Min(0, { message: 'Rating must be at least 0' })
  @Max(10, { message: 'Rating must not exceed 10' })
  rating: number;

  @IsInt({ message: 'Release year must be a number' })
  releaseYear: number;
}
