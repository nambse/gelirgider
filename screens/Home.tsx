import * as React from "react";
import {
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Category, Transaction, TransactionsByMonth } from "../types";
import { useSQLiteContext } from "expo-sqlite";
import TransactionList from "../components/TransactionsList";
import Card from "../components/ui/Card";
import { BlurView } from "expo-blur";
import { SymbolView } from "expo-symbols";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import SummaryChart from "../components/SummaryChart";
import { useTransactionStore } from '../store/transactionStore';
import TransactionDetailsSheet from "../components/sheets/TransactionDetailsSheet";
import DeleteConfirmationSheet from "../components/sheets/DeleteConfirmationSheet";
import { useState } from "react";

type StackParamList = {
  Home: undefined;
  Payment: { transaction?: Transaction } | undefined;
};

export default function Home() {
  const navigation =
    useNavigation<NativeStackNavigationProp<StackParamList>>();
  const db = useSQLiteContext();
  const { transactions, categories, monthlyStats, fetchTransactions, deleteTransaction } = useTransactionStore();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Veritabanı verilerini yükle
  React.useEffect(() => {
    fetchTransactions(db);
  }, [db]);

  const handleEdit = () => {
    if (selectedTransaction) {
      navigation.navigate("Payment", { transaction: selectedTransaction });
      setSelectedTransaction(null);
    }
  };

  const handleDelete = async () => {
    if (selectedTransaction) {
      setShowDeleteConfirmation(true);
    }
  };

  const confirmDelete = async () => {
    if (selectedTransaction) {
      try {
        await deleteTransaction(db, selectedTransaction.id);
        await fetchTransactions(db);
      } catch (error) {
        console.error("İşlem silme hatası:", error);
      } finally {
        setShowDeleteConfirmation(false);
        setSelectedTransaction(null);
      }
    }
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          padding: 15,
          paddingTop: Platform.OS === "ios" ? 170 : 16,
          paddingBottom: Platform.OS === "ios" ? 140 : 130,
        }}
      >
        <TransactionSummary
          totalExpenses={monthlyStats.totalExpenses}
          totalIncome={monthlyStats.totalIncome}
        />
        <TransactionList
          categories={categories}
          transactions={transactions}
          onSelectTransaction={setSelectedTransaction}
        />
      </ScrollView>
      <BlurView
        experimentalBlurMethod="dimezisBlurView"
        intensity={90}
        tint={"light"}
        style={styles.blur}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={{ color: "gray" }}>Toplam Birikim</Text>
            <Text style={{ fontWeight: "bold", fontSize: 28 }}>
              ₺{(monthlyStats.totalIncome - monthlyStats.totalExpenses).toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Payment")}
          >
            <SymbolView
              size={48}
              type="palette"
              name="plus.circle.fill"
              colors={["black", "transparent"]}
              style={{ backgroundColor: "#00000010", borderRadius: 50 }}
              fallback={
                <Button
                  title="Ekle"
                  onPress={() => navigation.navigate("Payment")}
                />
              }
            />
          </TouchableOpacity>
        </View>
      </BlurView>

      {selectedTransaction && (
        <TransactionDetailsSheet
          transaction={selectedTransaction}
          category={categories.find(c => c.id === selectedTransaction.category_id)}
          onClose={() => setSelectedTransaction(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {showDeleteConfirmation && (
        <DeleteConfirmationSheet
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteConfirmation(false);
            setSelectedTransaction(null);
          }}
        />
      )}
    </>
  );
}

// İşlem özeti bileşeni
function TransactionSummary({
  totalExpenses,
  totalIncome,
}: TransactionsByMonth) {
  return (
    <Card style={styles.container}>
      <SummaryChart />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingBottom: 7,
  },
  blur: {
    width: "100%",
    height: 110,
    position: "absolute",
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: "#00000010",
    padding: 16,
  },
});