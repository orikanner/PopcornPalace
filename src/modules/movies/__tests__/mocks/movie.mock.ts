import { Movie } from "../../entities/movie.entity";

export const createMovieMock = (override = {}): Movie => ({
    id: 1,
    title: 'Test Movie',
    genre: 'Action', 
    duration: 120,
    rating: 8.5,
    releaseYear: 2023,
    ...override
  });