import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column()
  genre: string;

  @Column()
  duration: number;

  @Column({ type: 'decimal' })
  rating: number;

  @Column()
  releaseYear: number;
}
