import { PartialType } from '@nestjs/mapped-types';
import { CreateShowtimeDto } from './create-showtime.dto';

/*
 cool trick like partialType in basic typescript
*/
export class UpdateShowtimeDto extends PartialType(CreateShowtimeDto) {}
