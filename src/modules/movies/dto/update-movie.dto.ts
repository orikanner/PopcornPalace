import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto';

/*
Extends partialType cause we know that the update movie dto will have all the properties of the create movie dto but not all of them are required
*/
export class UpdateMovieDto extends PartialType(CreateMovieDto) {}
