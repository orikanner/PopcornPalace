import { Movie } from "src/modules/movies/entities/movie.entity";
import { Showtime } from "../../entities/showtime.entity";

export const createShowtimeMock = (override: Partial<Showtime> = {}): Showtime => ({
    id: 1,
    price: 15,
    movieId: 1,
    movie: {} as Movie,
    theater: 'default',
    startTime: new Date(),
    endTime: new Date(),
    ...override
});