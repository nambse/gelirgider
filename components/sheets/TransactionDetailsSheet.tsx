import { BlurView } from "expo-blur";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Transaction, Category } from "../../types";
import { useNavigation } from "@react-navigation/native";
import { SymbolView } from "expo-symbols";
import { categoryColors, categoryEmojies } from "../../constants";

interface TransactionDetailsSheetProps {
  transaction: Transaction;
  category?: Category;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TransactionDetailsSheet({
  transaction,
  category,
  onClose,
  onEdit,
  onDelete,
}: TransactionDetailsSheetProps) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <BlurView
        experimentalBlurMethod="dimezisBlurView"
        intensity={90}
        tint="light"
        style={styles.sheet}
      >
        <View style={styles.header}>
          <Text style={styles.title}>İşlem Detayları</Text>
          <TouchableOpacity onPress={onClose}>
            <SymbolView
              name="xmark.circle.fill"
              size={28}
              type="hierarchical"
              weight="bold"
              tintColor={"#8E8E93"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Transaction Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Tutar</Text>
              <Text style={[
                styles.amount,
                { color: transaction.type === "Gider" ? "#FF3B30" : "#34C759" }
              ]}>
                ₺{transaction.amount.toFixed(2)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Açıklama</Text>
              <Text style={styles.detailValue}>{transaction.description}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Kategori</Text>
              <View style={[
                styles.categoryBadge,
                { backgroundColor: categoryColors[category?.name ?? "Default"] + "40" }
              ]}>
                <Text style={styles.categoryText}>
                  {categoryEmojies[category?.name ?? "Default"]} {category?.name}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tarih</Text>
              <Text style={styles.detailValue}>
                {new Date(transaction.date).toLocaleDateString("tr-TR", {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={onEdit}
            >
              <SymbolView
                name="pencil"
                size={20}
                type="hierarchical"
                weight="bold"
                tintColor={"#007AFF"}
              />
              <Text style={styles.editButtonText}>Düzenle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDelete}
            >
              <SymbolView
                name="trash"
                size={20}
                type="hierarchical"
                weight="bold"
                tintColor={"#FF3B30"}
              />
              <Text style={styles.deleteButtonText}>Sil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 16,
    paddingBottom: 32,
    maxHeight: '80%',
    zIndex: 1001,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    gap: 24,
  },
  detailsContainer: {
    gap: 16,
  },
  amountContainer: {
    alignItems: 'center',
    gap: 4,
  },
  amountLabel: {
    fontSize: 15,
    color: 'gray',
  },
  amount: {
    fontSize: 34,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 15,
    color: 'gray',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#007AFF20',
  },
  deleteButton: {
    backgroundColor: '#FF3B3020',
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '600',
  },
}); 