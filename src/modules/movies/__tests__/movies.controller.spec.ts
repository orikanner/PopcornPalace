import { TestingModule, Test } from "@nestjs/testing";
import { MoviesService } from "../movies.service";
import { createMovieDtoMock, updateMovieDtoMock } from "./mocks/movie-dto.mock";
import { createMovieMock } from "./mocks/movie.mock";
import { MoviesController } from "../movies.controller";
import { title } from "process";
describe('MoviesController', () => {
    let controller: MoviesController;
    let service: MoviesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [MoviesController],
            providers: [
                {
                    provide: MoviesService,
                    useValue: {
                        findAll: jest.fn(),
                        addMovie: jest.fn(),
                        updateMovie: jest.fn(),
                        deleteMovie: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<MoviesController>(MoviesController);
        service = module.get<MoviesService>(MoviesService);
    });

    it('should get all movies', async () => {
        const movies = [
            createMovieMock({ id: 123, title: 'Title 1' }),
            createMovieMock({ id: 123, title: 'Title 1' })
        ];
        jest.spyOn(service, 'findAll').mockResolvedValue(movies);

        const result = await controller.findAll();
        expect(result).toEqual(movies);
        expect(service.findAll).toHaveBeenCalled();
    });

    it('should create a new movie', async () => {
        const createDto = createMovieDtoMock();
        const createdMovie = createMovieMock();
        jest.spyOn(service, 'addMovie').mockResolvedValue(createdMovie);

        const result = await controller.addMovie(createDto);
        expect(result).toEqual(createdMovie);
        expect(service.addMovie).toHaveBeenCalledWith(createDto);
    });

    it('should update a movie', async () => {
        const title = 'Test Movie';
        const updateDto = updateMovieDtoMock();
        jest.spyOn(service, 'updateMovie').mockResolvedValue(undefined);

        await controller.updateMovie(title, updateDto);
        expect(service.updateMovie).toHaveBeenCalledWith(title, updateDto);
    });

    it('should delete a movie', async () => {
        const title = 'Movie to Delete';
        jest.spyOn(service, 'deleteMovie').mockResolvedValue(undefined);

        await controller.deleteMovie(title);
        expect(service.deleteMovie).toHaveBeenCalledWith(title);
    });
});