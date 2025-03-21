import { CreateMovieDto } from "../../dto/create-movie.dto";
import { UpdateMovieDto } from "../../dto/update-movie.dto";


export const createMovieDtoMock = (override = {}): CreateMovieDto => ({
    title: 'Movie Title KAiro',
    genre: 'Horror',
    duration: 75,
    rating: 9.1,
    releaseYear: 2021,
    ...override
});



export const updateMovieDtoMock = (override = {}): UpdateMovieDto => ({
    ...override
});