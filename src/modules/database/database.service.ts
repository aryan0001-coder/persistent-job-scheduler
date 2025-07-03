import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const password = process.env.DB_PASSWORD;
    if (typeof password !== 'string' || !password) {
      throw new Error(
        'DB_PASSWORD environment variable is not set or is not a string',
      );
    }
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password,
      port: Number(process.env.DB_PORT) || 5432,
    });
  }

  async query(text: string, params: any[] = []) {
    const client = await this.pool.connect();
    try {
      const res = await client.query(text, params);
      return res;
    } finally {
      client.release();
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
