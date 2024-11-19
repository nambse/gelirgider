import { useState } from "react";
import { View } from "react-native";
import { Category, Transaction } from "../types";
import TransactionListItem from "./TransactionListItem";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DeleteConfirmationSheet from "./sheets/DeleteConfirmationSheet";
import TransactionDetailsSheet from "./sheets/TransactionDetailsSheet";

// Navigation types
type RootStackParamList = {
  Home: undefined;
  Payment: { transaction?: Transaction } | undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

// İşlemler listesi bileşeni
export default function TransactionList({
  transactions,
  categories,
  onSelectTransaction,
}: {
  categories: Category[];
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
}) {
  return (
    <View style={{ gap: 15 }}>
      {transactions.map((transaction) => (
        <TransactionListItem
          key={transaction.id}
          transaction={transaction}
          categoryInfo={categories.find(category => category.id === transaction.category_id)}
          onActionPress={() => onSelectTransaction(transaction)}
        />
      ))}
    </View>
  );
}