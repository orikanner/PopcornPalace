import { Controller, Get, Post, Delete, Body, Param, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) { }

    @Get('/all')
    @HttpCode(200)
    async findAll() {
        return await this.moviesService.findAll();
    }

    @Post()
    @HttpCode(200)
    async addMovie(@Body() createMovieDto: CreateMovieDto) {
        return await this.moviesService.addMovie(createMovieDto);
    }

    @Post('/update/:movieTitle')
    @HttpCode(200)
    async updateMovie(
        @Param('movieTitle') movieTitle: string,
        @Body() updateMovieDto: UpdateMovieDto
    ): Promise<void> {
        if (!movieTitle || movieTitle.trim().length === 0) {
            throw new BadRequestException('Movie title is required in the URL.');
        }
        await this.moviesService.updateMovie(movieTitle, updateMovieDto);
    }

    @Delete(':movieTitle')
    @HttpCode(200)
    async deleteMovie(@Param('movieTitle') movieTitle: string): Promise<void> {
        if (!movieTitle || movieTitle.trim().length === 0) {
            throw new BadRequestException('Movie title is required in the URL.');
        }
        await this.moviesService.deleteMovie(movieTitle);
    }
}
