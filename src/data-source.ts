import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'identity',
  entities: [join(process.cwd(), 'src', 'modules', '**/*.entity.{.ts,.js}')],
  migrations: [join(process.cwd(), 'src', 'migrations', '*.ts')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});

export default AppDataSource;
