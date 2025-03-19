import { Movie } from 'src/modules/movies/entities/movie.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Showtime {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'decimal' })
    price: number;

    // if the movie is deleted, the relevant showtimes will be deleted
    // @Column()
    @ManyToOne(()=>Movie, {onDelete: 'CASCADE'}) 
    movieId: number;

    @Column()
    theater: string;

    @Column()
    startTime: Date;

    @Column()
    endTime: Date;
}
