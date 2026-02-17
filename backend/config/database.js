const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    this.pool = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
  }

  async connect() {
    try {
      // Get MySQL connection details from environment variables
      const host = process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost';
      const port = parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306');
      const user = process.env.MYSQL_USER || process.env.DB_USER || 'admin';
      const password = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || 'admin123';
      const database = process.env.MYSQL_DATABASE || process.env.DB_NAME || 'auth_db';

      console.log(`🔄 Connecting to MySQL at ${host}:${port}/${database}...`);

      // Create connection pool with optimized settings for Render
      this.pool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
        // Add these for better production performance
        connectTimeout: 10000,
        acquireTimeout: 10000,
        timeout: 60000,
        // SSL configuration if needed (for some cloud MySQL providers)
        ...(process.env.MYSQL_SSL === 'true' && {
          ssl: {
            rejectUnauthorized: false
          }
        })
      });

      // Test connection with retry logic
      await this._testConnectionWithRetry();
      
      this.isConnected = true;
      this.connectionAttempts = 0;
      console.log('✅ MySQL connected successfully with connection pooling');
      
      // Log pool configuration
      console.log(`📊 MySQL Pool: min=2, max=10, idle timeout=30000ms`);
      
      // Handle pool errors
      this.pool.on('connection', (connection) => {
        console.log('🔌 New MySQL connection established');
      });

      this.pool.on('error', (err) => {
        console.error('❌ MySQL pool error:', err.message);
        this.isConnected = false;
      });

      return this.pool;
    } catch (error) {
      console.error('❌ MySQL connection failed:', error.message);
      this.isConnected = false;
      
      // In production, we might want to retry indefinitely
      if (process.env.NODE_ENV === 'production') {
        console.log('🔄 Will retry MySQL connection in 5 seconds...');
        setTimeout(() => {
          this.connect().catch(e => console.error('MySQL retry failed:', e.message));
        }, 5000);
      }
      
      throw error;
    }
  }

  async _testConnectionWithRetry() {
    while (this.connectionAttempts < this.maxRetries) {
      try {
        const connection = await this.pool.getConnection();
        
        // Test query to verify connection
        await connection.query('SELECT 1');
        
        connection.release();
        return; // Success
      } catch (error) {
        this.connectionAttempts++;
        console.log(`⚠️ MySQL connection attempt ${this.connectionAttempts} failed:`, error.message);
        
        if (this.connectionAttempts >= this.maxRetries) {
          throw error;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts), 10000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  async query(sql, params) {
    if (!this.pool) {
      throw new Error('MySQL not connected. Call connect() first.');
    }
    
    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('❌ Database query error:', error.message);
      console.error('📝 SQL:', sql);
      console.error('📊 Params:', params);
      throw error;
    }
  }

  async queryOne(sql, params) {
    const results = await this.query(sql, params);
    return results[0] || null;
  }

  async insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    
    const result = await this.query(sql, values);
    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows
    };
  }

  async update(table, data, where, whereParams = []) {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), ...whereParams];
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
    
    const result = await this.query(sql, values);
    return {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows
    };
  }

  async delete(table, where, params) {
    const sql = `DELETE FROM ${table} WHERE ${where}`;
    const result = await this.query(sql, params);
    return {
      affectedRows: result.affectedRows
    };
  }

  async transaction() {
    if (!this.pool) {
      throw new Error('MySQL not connected. Call connect() first.');
    }
    
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();
    
    const transaction = {
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
      
      insert: async (table, data) => {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        
        const result = await transaction.query(sql, values);
        return {
          insertId: result.insertId,
          affectedRows: result.affectedRows
        };
      },
      
      update: async (table, data, where, whereParams = []) => {
        const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), ...whereParams];
        
        const sql = `UPDATE ${table} SET ${setClause} WHERE ${where}`;
        
        const result = await transaction.query(sql, values);
        return {
          affectedRows: result.affectedRows,
          changedRows: result.changedRows
        };
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
    
    return transaction;
  }

  async disconnect() {
    if (this.pool) {
      console.log('📊 Closing MySQL connection pool...');
      await this.pool.end();
      this.isConnected = false;
      this.pool = null;
      console.log('✅ MySQL connection closed');
    }
  }

  async testConnection() {
    try {
      const connection = await this.pool.getConnection();
      await connection.query('SELECT 1');
      connection.release();
      return true;
    } catch (error) {
      console.error('❌ MySQL connection test failed:', error.message);
      return false;
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      poolSize: this.pool ? 'Active' : 'Inactive'
    };
  }
}

// Create singleton instance
const database = new Database();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📥 SIGTERM received, closing MySQL connection...');
  await database.disconnect();
});

process.on('SIGINT', async () => {
  console.log('📥 SIGINT received, closing MySQL connection...');
  await database.disconnect();
});

module.exports = database;