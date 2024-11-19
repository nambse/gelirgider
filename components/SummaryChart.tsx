import SegmentedControl from "@react-native-segmented-control/segmented-control";
import * as React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { BarChart, barDataItem } from "react-native-gifted-charts";
import { useSQLiteContext } from "expo-sqlite";
import { SymbolView } from "expo-symbols";
import { useTransactionStore } from "../store/transactionStore";

// Grafik periyot türleri
enum Period {
  week = "week",
  month = "month",
  year = "year",
}

export default function SummaryChart() {
  const db = useSQLiteContext();
  const { fetchTransactions } = useTransactionStore();
  const [chartPeriod, setChartPeriod] = React.useState<Period>(Period.week);
  const [barData, setBarData] = React.useState<barDataItem[]>([]);
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [currentEndDate, setCurrentEndDate] = React.useState<Date>(new Date());
  const [chartKey, setChartKey] = React.useState(0);
  const [transactionType, setTransactionType] = React.useState<
    "Gelir" | "Gider"
  >("Gelir");

  // Veri yükleme efekti
  React.useEffect(() => {
    const fetchData = async () => {
      if (chartPeriod === Period.week) {
        const { startDate, endDate } = getWeekRange(currentDate);
        setCurrentEndDate(startDate);
        const data = await fetchWeeklyData(startDate, endDate, transactionType);
        setBarData(processWeeklyData(data, transactionType));
        setChartKey((prev) => prev + 1);
      }
    };
    fetchData();
  }, [chartPeriod, currentDate, transactionType, fetchTransactions]);

  // Türkçe gün kısaltmaları
  const turkishDays = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

  // Hafta aralığını hesaplama
  const getWeekRange = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return {
      startDate: startOfWeek,
      endDate: endOfWeek,
    };
  };

  // Önceki haftaya geçiş
  const handlePreviousWeek = () => {
    setCurrentDate(
      () => new Date(currentDate.setDate(currentDate.getDate() - 7))
    );
  };

  // Sonraki haftaya geçiş
  const handleNextWeek = () => {
    setCurrentDate(
      () => new Date(currentDate.setDate(currentDate.getDate() + 7))
    );
  };

  // Belirli bir haftanın işlemlerini getir
  const fetchWeeklyData = async (
    startDate: Date,
    endDate: Date,
    type: "Gelir" | "Gider"
  ) => {
    try {
      // Format dates as YYYY-MM-DD
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

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
      }>(query, [formatDate(startDate), formatDate(endDate), type]);

      // Gün indekslerini (0-6) günler dizisi indeksleriyle (1-7) eşleştir
      const formattedResult = result.map((item) => ({
        dayOfWeek: item.day_of_week,
        total: item.total,
      }));

      return formattedResult;
    } catch (e) {
      console.error("Haftalık veri getirme hatası:", e);
      if (e instanceof Error) {
        console.error("Hata mesajı:", e.message);
        console.error("Hata stack:", e.stack);
      }
      return [];
    }
  };

  // Haftalık verileri grafik için işle
  const processWeeklyData = (
    data: { dayOfWeek: number; total: number }[],
    transactionsType: "Gelir" | "Gider" = "Gelir"
  ) => {
    const isIncome = transactionsType === "Gelir";
  
    // Her gün için varsayılan veri oluştur
    let barData = turkishDays.map(
      (label) =>
        ({
          label,
          value: 0,
          frontColor: "#d1d5db",
          gradientColor: "#d1d5db",
        } as any)
    );

    // Verileri işle ve renkleri ayarla
    data.forEach((item) => {
      const dayIndex = item.dayOfWeek;
      if (dayIndex >= 0 && dayIndex < 7) {
        barData[dayIndex].value = item.total;
        if (item.total < 100) {
          barData[dayIndex].frontColor = "#d1d5db";
          barData[dayIndex].gradientColor = "#d1d5db";
        } else {
          barData[dayIndex].frontColor = isIncome ? "#d3ff00" : "#ffab00";
          barData[dayIndex].gradientColor = isIncome ? "#12ff00" : "#ff0000";
        }
      }
    });
  
    return barData;
  };

  return (
    <View>
      <Text style={{ fontWeight: "700", fontSize: 18, marginBottom: 8 }}>
        {currentEndDate.toLocaleDateString("tr-TR", { 
          day: "numeric",
          month: "long"
        })} - {" "}
        {currentDate.toLocaleDateString("tr-TR", { 
          day: "numeric",
          month: "long"
        })}
      </Text>
      <Text style={{ color: "gray" }}>
        Toplam {transactionType === "Gider" ? "Harcama" : "Gelir"}{" "}
      </Text>

      <Text style={{ fontWeight: "700", fontSize: 32, marginBottom: 16 }}>
        ₺{barData.reduce((total, item) => total + item.value, 0).toFixed(2)}
      </Text>
      <BarChart
        key={chartKey}
        data={barData}
        barWidth={18}
        height={200}
        width={290}
        minHeight={3}
        barBorderRadius={3}
        showGradient
        spacing={20}
        noOfSections={4}
        yAxisThickness={0}
        xAxisThickness={0}
        xAxisLabelsVerticalShift={2}
        xAxisLabelTextStyle={{ color: "gray" }}
        yAxisTextStyle={{ color: "gray" }}
        isAnimated
        animationDuration={300}
      />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginTop: 16,
        }}
      >
        <TouchableOpacity
          onPress={handlePreviousWeek}
          style={{ alignItems: "center" }}
        >
          <SymbolView
            name="chevron.left.circle.fill"
            size={40}
            type="hierarchical"
            tintColor={"gray"}
          />
          <Text style={{ fontSize: 11, color: "gray" }}>Önceki Hafta</Text>
        </TouchableOpacity>
        <SegmentedControl
          values={["Gelir", "Gider"]}
          style={{ width: 200 }}
          selectedIndex={transactionType === "Gelir" ? 0 : 1}
          onChange={(event) => {
            const index = event.nativeEvent.selectedSegmentIndex;
            if (index === 0) {
              setTransactionType("Gelir");
            } else {
              setTransactionType("Gider");
            }
          }}
        />
        <TouchableOpacity
          onPress={handleNextWeek}
          style={{ alignItems: "center" }}
        >
          <SymbolView
            name="chevron.right.circle.fill"
            size={40}
            type="hierarchical"
            tintColor={"gray"}
          />
          <Text style={{ fontSize: 11, color: "gray" }}>Sonraki Hafta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}