import { BlurView } from "expo-blur";
import { StyleSheet, Text, TouchableOpacity, View, Pressable } from "react-native";

interface DeleteConfirmationSheetProps {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteConfirmationSheet({
  onConfirm,
  onCancel,
}: DeleteConfirmationSheetProps) {
  const handleDelete = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error("Silme işlemi başarısız:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backdrop} onPress={onCancel} />
      <BlurView
        experimentalBlurMethod="dimezisBlurView"
        intensity={90}
        tint="light"
        style={styles.sheet}
      >
        <View style={styles.content}>
          <Text style={styles.title}>İşlemi Sil</Text>
          <Text style={styles.message}>
            Bu işlemi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelButtonText}>Vazgeç</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleDelete}
            >
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    width: '100%',
    maxWidth: 500,
    borderRadius: 14,
    overflow: 'hidden',
    zIndex: 1001,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 20,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#8E8E9320',
  },
  deleteButton: {
    backgroundColor: '#FF3B3020',
  },
  cancelButtonText: {
    color: '#8E8E93',
    fontSize: 17,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '600',
  },
}); 