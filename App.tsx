import * as React from "react";
import { SQLiteProvider } from "expo-sqlite";
import { ActivityIndicator, Platform, Text, View, StyleSheet } from "react-native";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./screens/Home";
import Payment from "./screens/sheets/Payment";
import { Transaction } from "./types";
import { SymbolView } from "expo-symbols";

type StackParamList = {
  Home: undefined;
  Payment: { transaction?: Transaction } | undefined;
};

const Stack = createNativeStackNavigator<StackParamList>();

// Özel başlık bileşeni
function HeaderTitle() {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerEmoji}>💰</Text>
      <Text style={styles.headerTitle}>Gelir Gider App</Text>
    </View>
  );
}

const loadDatabase = async () => {
  const dbName = "gelirgider.db";
  const dbAsset = require("./assets/gelirgider.db");
  const dbUri = Asset.fromModule(dbAsset).uri;
  const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

  try {
    // SQLite klasörünü oluştur
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}SQLite`,
      { intermediates: true }
    ).catch((error) => {
      if (error.code !== 'ERR_DIRECTORY_EXISTS') {
        throw error;
      }
    });

    // Veritabanı dosyasının varlığını kontrol et
    const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
    
    if (!fileInfo.exists) {
      // Veritabanını assets'ten kopyala
      await FileSystem.downloadAsync(dbUri, dbFilePath);
      console.log("Veritabanı başarıyla yüklendi:", dbFilePath);
    } else {
      console.log("Veritabanı zaten mevcut:", dbFilePath);
    }

  } catch (error) {
    console.error("Veritabanı yükleme hatası:", error);
    throw error;
  }
};

export default function App() {
  const [dbLoaded, setDbLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {
    loadDatabase()
      .then(() => setDbLoaded(true))
      .catch((e) => console.error(e));
  }, []);

  if (!dbLoaded)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={"large"} color="#007AFF" />
        <Text style={styles.loadingText}>Veritabanı yükleniyor...</Text>
      </View>
    );

  return (
    <NavigationContainer>
      <React.Suspense
        fallback={
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={"large"} color="#007AFF" />
            <Text style={styles.loadingText}>Veritabanı yükleniyor...</Text>
          </View>
        }
      >
        <SQLiteProvider databaseName="gelirgider.db" useSuspense>
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              component={Home}
              options={{
                headerTitle: () => <HeaderTitle />,
                headerLargeTitle: true,
                headerTransparent: Platform.OS === "ios",
                headerBlurEffect: "regular",
                headerStyle: {
                  backgroundColor: Platform.OS === "ios" ? "transparent" : "#fff",
                },
                headerLargeStyle: {
                  backgroundColor: Platform.OS === "ios" ? "transparent" : "#fff",
                },
                headerLargeTitleStyle: styles.headerLargeTitle,
              }}
            />
            <Stack.Screen
              name="Payment"
              component={Payment}
              options={{
                presentation: "transparentModal",
                animation: "slide_from_bottom",
                animationTypeForReplace: "pop",
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </SQLiteProvider>
      </React.Suspense>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 8,
  },
  headerEmoji: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Platform.OS === "ios" ? "#000" : "#000",
  },
  headerLargeTitle: {
    color: "#000",
    fontWeight: "bold",
  },
});