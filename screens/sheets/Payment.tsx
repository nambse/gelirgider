import { useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import { Category, Transaction } from "../../types";
import { categoryColors, categoryEmojies } from "../../constants";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTransactionStore } from '../../store/transactionStore';

interface PaymentProps {
  route?: {
    params?: {
      transaction?: Transaction;
    };
  };
}

export default function Payment({ route }: PaymentProps) {
  const navigation = useNavigation();
  const db = useSQLiteContext();
  const { categories, addTransaction, editTransaction } = useTransactionStore();
  
  const editingTransaction = route?.params?.transaction;
  const isEditMode = !!editingTransaction;

  // Form state
  const [amount, setAmount] = useState(
    isEditMode ? editingTransaction.amount.toString() : ""
  );
  const [description, setDescription] = useState(
    isEditMode ? editingTransaction.description : ""
  );
  const [type, setType] = useState<"Gelir" | "Gider">(
    isEditMode ? editingTransaction.type : "Gider"
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(
    isEditMode ? new Date(editingTransaction.date) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Seçilen tipe göre kategorileri filtrele
  const filteredCategories = categories.filter(category => category.type === type);

  // Kategori seçimi değiştiğinde veya tip değiştiğinde kategori seçimini sıfırla
  useEffect(() => {
    setSelectedCategory(null);
  }, [type]);

  // Düzenleme modunda başlangıç kategorisini ayarla
  useEffect(() => {
    if (isEditMode && editingTransaction) {
      const initialCategory = categories.find(
        cat => cat.id === editingTransaction.category_id
      );
      setSelectedCategory(initialCategory || null);
    }
  }, [isEditMode, editingTransaction, categories]);

  // Tarih formatlama fonksiyonu
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("tr-TR", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // İşlem kaydetme fonksiyonu
  const handleSave = async () => {
    if (!amount || !description || !selectedCategory) {
      return;
    }

    try {
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      if (isEditMode) {
        await editTransaction(db, {
          id: editingTransaction.id,
          amount: parseFloat(amount),
          date: formattedDate,
          description,
          type,
          category_id: selectedCategory.id,
        });
      } else {
        await addTransaction(db, {
          amount: parseFloat(amount),
          date: formattedDate,
          description,
          type,
          category_id: selectedCategory.id,
        });
      }

      navigation.goBack();
    } catch (error) {
      console.error(isEditMode ? "İşlem güncelleme hatası:" : "İşlem ekleme hatası:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Pressable style={{ flex: 1 }} onPress={() => navigation.goBack()}>
        <View />
      </Pressable>
      <BlurView
        experimentalBlurMethod="dimezisBlurView"
        intensity={90}
        tint="light"
        style={styles.blurContainer}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButton}>İptal</Text>
          </Pressable>
          <Text style={styles.title}>{isEditMode ? "İşlemi Düzenle" : "Yeni İşlem"}</Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={!amount || !description || !selectedCategory}
          >
            <Text style={[
              styles.addButton,
              (!amount || !description || !selectedCategory) && styles.disabledButton
            ]}>
              {isEditMode ? "Güncelle" : "Ekle"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer}>
          <SegmentedControl
            values={["Gider", "Gelir"]}
            selectedIndex={type === "Gider" ? 0 : 1}
            onChange={(event) => {
              setType(event.nativeEvent.selectedSegmentIndex === 0 ? "Gider" : "Gelir");
            }}
            style={styles.segmentedControl}
          />

          <View style={styles.inputContainer}>
            <Text style={styles.currencySymbol}>₺</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor="gray"
            />
          </View>

          <TextInput
            style={styles.descriptionInput}
            placeholder="Açıklama"
            value={description}
            onChangeText={setDescription}
            placeholderTextColor="gray"
          />

          {/* Tarih Seçici */}
          <TouchableOpacity 
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateSelectorLabel}>Tarih</Text>
            <Text style={styles.dateSelectorValue}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>

          {showDatePicker && Platform.OS === 'ios' && (
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={(event, date) => {
                  if (date) setSelectedDate(date);
                }}
                locale="tr-TR"
              />
              <TouchableOpacity 
                style={styles.datePickerDoneButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerDoneButtonText}>Tamam</Text>
              </TouchableOpacity>
            </View>
          )}

          {showDatePicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setSelectedDate(date);
              }}
            />
          )}

          <Text style={styles.categoryTitle}>Kategori</Text>
          <View style={styles.categoryContainer}>
            {filteredCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  { backgroundColor: categoryColors[category.name] + "40" },
                  selectedCategory?.id === category.id && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={styles.categoryText}>
                  {categoryEmojies[category.name]} {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    height: "80%", // Increased height for category section
    width: "100%",
    position: "absolute",
    bottom: 0,
    elevation: 8,
    shadowColor: "#000",
    shadowRadius: 8,
    shadowOpacity: 0.15,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  cancelButton: {
    color: "#007AFF",
    fontSize: 17,
  },
  addButton: {
    color: "#007AFF",
    fontSize: 17,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  formContainer: {
    flex: 1,
  },
  segmentedControl: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingBottom: 10,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: "600",
    flex: 1,
    color: "#333",
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
  },
  descriptionInput: {
    fontSize: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingBottom: 10,
    marginBottom: 20,
    color: "#333",
    ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}),
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  categoryText: {
    fontSize: 15,
    color: "#333",
  },
  dateSelector: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingVertical: 12,
    marginBottom: 20,
  },
  dateSelectorLabel: {
    fontSize: 14,
    color: "gray",
    marginBottom: 4,
  },
  dateSelectorValue: {
    fontSize: 17,
    color: "#333",
  },
  datePickerContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  datePickerDoneButton: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    marginTop: 8,
  },
  datePickerDoneButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
