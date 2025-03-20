import { Movie } from 'src/modules/movies/entities/movie.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Showtime {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'decimal' })
    price: number;

    @Column()
    movieId: number;

    
    // if the movie is deleted, the relevant showtimes will be deleted as well
    @ManyToOne(()=>Movie, {onDelete: 'CASCADE'}) 
    @JoinColumn({name: 'movieId'}) // 
    movie: Movie;

    @Column()
    theater: string;

    @Column()
    startTime: Date;

    @Column()
    endTime: Date;
}
