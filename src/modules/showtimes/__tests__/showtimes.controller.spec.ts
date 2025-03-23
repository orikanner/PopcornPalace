import { TestingModule, Test } from "@nestjs/testing";
import { ShowtimesService } from "../showtimes.service";
import { createShowtimeDtoMock, updateShowtimeDtoMock } from "./mocks/showtime-dto.mock";
import { createShowtimeMock } from "./mocks/showtime.mock";
import { ShowtimesController } from "../showtimes.controller";
import { title } from "process";
import { Showtime } from "../entities/showtime.entity";
import { CreateShowtimeDto } from "../dto/create-showtime.dto";

describe('MoviesController', () => {
  let controller: ShowtimesController;
  let service: ShowtimesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShowtimesController],
      providers: [
        {
          provide: ShowtimesService,
          useValue: {
            getShowtimeById: jest.fn(),
            addShowtime: jest.fn(),
            updateShowtime: jest.fn(),
            deleteShowtime: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ShowtimesController>(ShowtimesController);
    service = module.get<ShowtimesService>(ShowtimesService);
  });

  it('should get a showtime by id', async () => {
    const showtime = createShowtimeMock({ id: 123 })

    jest.spyOn(service, 'getShowtimeById').mockResolvedValue(showtime);

    const result = await controller.getShowtimeById(123);
    expect(result).toEqual(showtime);
    expect(service.getShowtimeById).toHaveBeenCalled();
  });

  it('should add a new showtime', async () => {
    const showtimeDto: Partial<Showtime> = createShowtimeDtoMock();
    const createdShowtime = createShowtimeMock(showtimeDto);
    jest.spyOn(service, 'addShowtime').mockResolvedValue(createdShowtime);

    const result = await controller.addShowtime(showtimeDto as CreateShowtimeDto);
    expect(result).toEqual(createdShowtime);
    expect(service.addShowtime).toHaveBeenCalledWith(showtimeDto);
  });

  it('should update a showtime', async () => {
    const showtimeId = 123;
    const updateShowtimeDto = updateShowtimeDtoMock({ price: 25 });
  
    jest.spyOn(service, 'updateShowtime').mockResolvedValue(undefined);
  
    await controller.updateShowtime(showtimeId, updateShowtimeDto);
    expect(service.updateShowtime).toHaveBeenCalledWith(showtimeId, updateShowtimeDto);
  });

  it('should delete a showtime', async () => {
    const showtimeIdToDelete = 123;
    jest.spyOn(service, 'deleteShowtime').mockResolvedValue(undefined);

    await controller.deleteShowtime(showtimeIdToDelete);
    expect(service.deleteShowtime).toHaveBeenCalledWith(showtimeIdToDelete);
  });

});