import { AntDesign } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Category, Transaction } from "../types";
import { AutoSizeText, ResizeTextMode } from "react-native-auto-size-text";
import { categoryColors, categoryEmojies } from "../constants";
import Card from "./ui/Card";
import { SymbolView } from "expo-symbols";
import React from "react";

interface TransactionListItemProps {
  transaction: Transaction;
  categoryInfo: Category | undefined;
  onActionPress: (event: any) => void;
}

// İşlem öğesi bileşeni
export default function TransactionListItem({
  transaction,
  categoryInfo,
  onActionPress,
}: TransactionListItemProps) {
  // İşlem tipine göre simge ve renk belirleme
  const iconName =
    transaction.type === "Gider" ? "minuscircle" : "pluscircle";
  const color = transaction.type === "Gider" ? "red" : "green";
  const categoryColor = categoryColors[categoryInfo?.name ?? "Default"];
  const emoji = categoryEmojies[categoryInfo?.name ?? "Default"];
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onActionPress(transaction)}
      activeOpacity={0.7}
    >
      <Card>
        <View style={styles.innerContainer}>
          <View style={styles.mainContent}>
            <View style={styles.amountSection}>
              <Amount
                amount={transaction.amount}
                color={color}
                iconName={iconName}
              />
              <CategoryItem
                categoryColor={categoryColor}
                categoryInfo={categoryInfo}
                emoji={emoji}
              />
            </View>
            <View style={styles.infoSection}>
              <TransactionInfo
                date={transaction.date}
                description={transaction.description}
                id={transaction.id}
              />
            </View>
          </View>
          
          <View style={styles.actionButton}>
            <SymbolView
              name="chevron.right"
              size={20}
              type="hierarchical"
              weight="bold"
              tintColor={"#8E8E93"}
            />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

// İşlem bilgileri alt bileşeni
function TransactionInfo({
  id,
  date,
  description,
}: {
  id: number;
  date: string;
  description: string;
}) {
  // Tarihi güvenli bir şekilde işle
  const formatDate = (dateStr: string) => {
    try {
      if (typeof dateStr !== 'string') {
        console.error('Geçersiz tarih formatı:', dateStr);
        return new Date().toLocaleDateString("tr-TR", {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) {
        console.error('Geçersiz tarih:', dateStr);
        return new Date().toLocaleDateString("tr-TR", {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      return dateObj.toLocaleDateString("tr-TR", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Tarih biçimlendirme hatası:', error);
      return new Date().toLocaleDateString("tr-TR", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return (
    <View style={{ flexGrow: 1, gap: 6, flexShrink: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: "bold" }}>{description}</Text>
      <Text>İşlem No: {id}</Text>
      <Text style={{ fontSize: 12, color: "gray" }}>
        {formatDate(date)}
      </Text>
    </View>
  );
}

// Kategori öğesi alt bileşeni
function CategoryItem({
  categoryColor,
  categoryInfo,
  emoji,
}: {
  categoryColor: string;
  categoryInfo: Category | undefined;
  emoji: string;
}) {
  return (
    <View
      style={[
        styles.categoryContainer,
        { backgroundColor: categoryColor + "40" },
      ]}
    >
      <Text style={styles.categoryText}>
        {emoji} {categoryInfo?.name}
      </Text>
    </View>
  );
}

// Tutar gösterimi alt bileşeni
function Amount({
  iconName,
  color,
  amount,
}: {
  iconName: "minuscircle" | "pluscircle";
  color: string;
  amount: number;
}) {
  return (
    <View style={styles.row}>
      <AntDesign name={iconName} size={18} color={color} />
      <AutoSizeText
        fontSize={32}
        mode={ResizeTextMode.max_lines}
        numberOfLines={1}
        style={[styles.amount, { maxWidth: "80%" }]}
      >
        ₺{amount}
      </AutoSizeText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  amountSection: {
    width: "40%",
    gap: 3,
  },
  infoSection: {
    flex: 1,
    paddingRight: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryContainer: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 12,
  },
  actionButton: {
    padding: 4,
    justifyContent: 'center',
  },
});