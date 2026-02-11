const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = mysql.createPool({
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        user: process.env.MYSQL_USER || 'admin',
        password: process.env.MYSQL_PASSWORD || 'admin123',
        database: process.env.MYSQL_DATABASE || 'auth_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });

      // Test connection
      const connection = await this.pool.getConnection();
      console.log('✅ MySQL connected successfully');
      connection.release();
      
      return this.pool;
    } catch (error) {
      console.error('❌ MySQL connection failed:', error.message);
      throw error;
    }
  }

  async query(sql, params) {
    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error.message);
      throw error;
    }
  }

  async transaction() {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();
    
    return {
      query: async (sql, params) => {
        try {
          const [results] = await connection.execute(sql, params);
          return results;
        } catch (error) {
          await connection.rollback();
          connection.release();
          throw error;
        }
      },
      commit: async () => {
        try {
          await connection.commit();
          connection.release();
        } catch (error) {
          await connection.rollback();
          connection.release();
          throw error;
        }
      },
      rollback: async () => {
        await connection.rollback();
        connection.release();
      }
    };
  }

  async disconnect() {
    if (this.pool) {
      await this.pool.end();
      console.log('MySQL connection closed');
    }
  }
}

module.exports = new Database();