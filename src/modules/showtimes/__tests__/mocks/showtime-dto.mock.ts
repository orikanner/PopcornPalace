import { CreateShowtimeDto } from "../../dto/create-showtime.dto";
import { UpdateShowtimeDto } from "../../dto/update-showtime.dto";

export const createShowtimeDtoMock = (override = {}): CreateShowtimeDto => ({
    movieId: 1,
    theater: 'default',
    price: 15,
    startTime: new Date(),
    endTime: new Date(),
    ...override
});

export const updateShowtimeDtoMock = (override = {}): UpdateShowtimeDto => ({
    ...override
});