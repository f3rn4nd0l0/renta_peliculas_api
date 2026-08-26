import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';


@Entity('clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar', {
    length: 255
  })
  nombre!: string;

  @Column('varchar', {
    length: 255,
    unique: true,
  })
  correo!: string;

  @Column('varchar', {
    length: 255,
    select: false,
  })
  password!: string;

  @Column('json')
  roles!: string[];

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    if (!this.roles) this.roles = ['user'];
  }
}