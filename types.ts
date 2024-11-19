// İşlem arayüzü
export interface Transaction {
    id: number;
    category_id: number;
    amount: number;
    date: string;
    description: string;
    type: "Gider" | "Gelir";
  }
  
  // Kategori arayüzü
  export interface Category {
    id: number;
    name: string;
    type: "Gider" | "Gelir";
  }
  
  // Aylık işlem özeti arayüzü
  export interface TransactionsByMonth {
    totalExpenses: number; // Toplam giderler
    totalIncome: number;   // Toplam gelirler
  }