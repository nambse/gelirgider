import { create } from 'zustand';
import { Category, Transaction, TransactionsByMonth } from '../types';
import { SQLiteDatabase } from 'expo-sqlite';

interface TransactionStore {
  // State
  transactions: Transaction[];
  categories: Category[];
  monthlyStats: TransactionsByMonth;
  weeklyData: {
    startDate: string;
    endDate: string;
    data: { dayOfWeek: number; total: number }[];
  };
  
  // Actions
  fetchTransactions: (db: SQLiteDatabase) => Promise<void>;
  addTransaction: (db: SQLiteDatabase, transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (db: SQLiteDatabase, id: number) => Promise<void>;
  editTransaction: (db: SQLiteDatabase, transaction: Transaction) => Promise<void>;
  fetchWeeklyData: (db: SQLiteDatabase, startDate: string, endDate: string, type: "Gelir" | "Gider") => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  transactions: [],
  categories: [],
  monthlyStats: {
    totalExpenses: 0,
    totalIncome: 0,
  },
  weeklyData: {
    startDate: '',
    endDate: '',
    data: [],
  },

  fetchTransactions: async (db) => {
    try {
      // Son 30 işlemi getir (tarihe göre sıralı)
      const transactions = await db.getAllAsync<Transaction>(
        `SELECT * FROM Transactions 
         ORDER BY date DESC, id DESC
         LIMIT 30;`
      );

      // Tüm kategorileri getir
      const categories = await db.getAllAsync<Category>(
        `SELECT * FROM Categories;`
      );

      // Mevcut ay için tarih aralığını hesapla
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const lastDay = new Date(year, parseInt(month), 0).getDate().toString().padStart(2, '0');
      
      const startDate = `${year}-${month}-01`;
      const endDate = `${year}-${month}-${lastDay}`;

      // Aylık istatistikleri getir
      const monthlyStats = await db.getAllAsync<TransactionsByMonth>(
        `
        SELECT
          COALESCE(SUM(CASE WHEN type = 'Gider' THEN amount ELSE 0 END), 0) AS totalExpenses,
          COALESCE(SUM(CASE WHEN type = 'Gelir' THEN amount ELSE 0 END), 0) AS totalIncome
        FROM Transactions
        WHERE date >= ? AND date <= ?;
      `,
        [startDate, endDate]
      );

      set({
        transactions,
        categories,
        monthlyStats: monthlyStats[0],
      });
    } catch (error) {
      console.error("Veri getirme hatası:", error);
    }
  },

  fetchWeeklyData: async (db, startDate, endDate, type) => {
    try {
      const query = `
        SELECT 
          CAST(strftime('%w', date) AS INTEGER) as day_of_week,
          SUM(amount) as total 
        FROM Transactions 
        WHERE date >= ? AND date <= ? AND type = ? 
        GROUP BY day_of_week
        ORDER BY day_of_week ASC
      `;

      const result = await db.getAllAsync<{
        day_of_week: number;
        total: number;
      }>(query, [startDate, endDate, type]);

      set({
        weeklyData: {
          startDate,
          endDate,
          data: result.map(item => ({
            dayOfWeek: item.day_of_week,
            total: item.total,
          })),
        },
      });
    } catch (error) {
      console.error("Haftalık veri getirme hatası:", error);
    }
  },

  addTransaction: async (db, transaction) => {
    try {
      await db.runAsync(
        `INSERT INTO Transactions (amount, date, description, type, category_id) 
         VALUES (?, ?, ?, ?, ?);`,
        [
          transaction.amount,
          transaction.date,
          transaction.description,
          transaction.type,
          transaction.category_id,
        ]
      );

      // Tüm verileri yeniden yükle
      await get().fetchTransactions(db);
      
      // Haftalık verileri de güncelle
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0];
      };

      await get().fetchWeeklyData(
        db,
        formatDate(startOfWeek),
        formatDate(endOfWeek),
        transaction.type
      );
    } catch (error) {
      console.error("İşlem ekleme hatası:", error);
      throw error;
    }
  },

  deleteTransaction: async (db, id) => {
    try {
      await db.runAsync(`DELETE FROM Transactions WHERE id = ?;`, [id]);
      await get().fetchTransactions(db);
    } catch (error) {
      console.error("İşlem silme hatası:", error);
      throw error;
    }
  },

  editTransaction: async (db, transaction) => {
    try {
      await db.runAsync(
        `UPDATE Transactions 
         SET amount = ?, date = ?, description = ?, type = ?, category_id = ?
         WHERE id = ?;`,
        [
          transaction.amount,
          transaction.date,
          transaction.description,
          transaction.type,
          transaction.category_id,
          transaction.id,
        ]
      );

      await get().fetchTransactions(db);
    } catch (error) {
      console.error("İşlem güncelleme hatası:", error);
      throw error;
    }
  },
})); 