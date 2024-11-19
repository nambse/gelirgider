-- 1. Veritabanı oluştur
sqlite3 gelirgider.db

-- 2. Tabloları oluştur
CREATE TABLE IF NOT EXISTS Categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Gider', 'Gelir'))
);

CREATE TABLE IF NOT EXISTS Transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('Gider', 'Gelir')),
  FOREIGN KEY (category_id) REFERENCES Categories (id)
);

-- 3. Kategorileri ekle
INSERT INTO Categories (name, type) VALUES ('Faturalar', 'Gider');
INSERT INTO Categories (name, type) VALUES ('Elektronik', 'Gider');
INSERT INTO Categories (name, type) VALUES ('Dışarıda Yemek', 'Gider');
INSERT INTO Categories (name, type) VALUES ('Kahvaltılık', 'Gider');
INSERT INTO Categories (name, type) VALUES ('Ev Eşyaları', 'Gider');
INSERT INTO Categories (name, type) VALUES ('Market Alışverişi', 'Gider');
INSERT INTO Categories (name, type) VALUES ('Ulaşım', 'Gider');
INSERT INTO Categories (name, type) VALUES ('Eğlence', 'Gider');
INSERT INTO Categories (name, type) VALUES ('Maaş', 'Gelir');
INSERT INTO Categories (name, type) VALUES ('Prim', 'Gelir');
INSERT INTO Categories (name, type) VALUES ('Danışmanlık İşi', 'Gelir');
INSERT INTO Categories (name, type) VALUES ('Yarı Zamanlı İş', 'Gelir');
INSERT INTO Categories (name, type) VALUES ('Online Satışlar', 'Gelir');
INSERT INTO Categories (name, type) VALUES ('Serbest Yazarlık', 'Gelir');
INSERT INTO Categories (name, type) VALUES ('Ek İş Geliri', 'Gelir');

-- 4. Verilerin eklendiğini kontrol et
SELECT * FROM Categories;

-- Giderler
-- Kasım 2024 (Mevcut ay)
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (1, 2500.00, '2024-11-06', 'Kira', 'Gider');
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (1, 750.50, '2024-11-07', 'Elektrik Faturası', 'Gider');
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (1, 250.75, '2024-11-08', 'Su Faturası', 'Gider');
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (1, 180.25, '2024-11-09', 'İnternet Faturası', 'Gider');
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (6, 850.00, '2024-11-10', 'Haftalık Market', 'Gider');
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (3, 225.50, '2024-11-11', 'Öğle Yemeği', 'Gider');
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (7, 300.00, '2024-11-12', 'Akbil Yükleme', 'Gider');

-- Ekim 2024
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (6, 920.75, '2024-10-06', 'Market Alışverişi', 'Gider');
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (2, 4500.00, '2024-10-07', 'Yeni Telefon', 'Gider');
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (8, 450.25, '2024-10-08', 'Sinema ve Yemek', 'Gider');

-- Gelirler
-- Kasım 2024 (Mevcut ay)
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (9, 15000.00, '2024-11-06', 'Kasım Maaşı', 'Gelir');
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (11, 2500.00, '2024-11-07', 'Yazılım Danışmanlığı', 'Gelir');
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (13, 1200.00, '2024-11-08', 'E-ticaret Satışları', 'Gelir');
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (14, 800.00, '2024-11-09', 'Blog Yazarlığı', 'Gelir');
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (12, 1500.00, '2024-11-10', 'Part-time İş', 'Gelir');

-- Ekim 2024
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (9, 15000.00, '2024-10-06', 'Ekim Maaşı', 'Gelir');
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (10, 5000.00, '2024-10-07', 'Q3 Performans Primi', 'Gelir');
INSERT INTO Transactions (category_id, amount, date, description, type) VALUES (15, 2000.00, '2024-10-08', 'Ek Proje Geliri', 'Gelir');

-- 5. Verileri kontrol et
SELECT * FROM Transactions;

-- 6. Veritabanından çık
.quit