
import { ThemeButton } from "@/components/ThemeButton";
import UnorderedList from "@/components/UnorderedList";
import { Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme-colors";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
export default function Index() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const broadcasting = [
    'Smart Goal Tracking',
    'Subscription Management',
    'Finance Companion',
    'AI-Powered Budgeting',
    'Archivements & More!'
  ]

  const [showLandingViewA, setShowLandingViewA] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLandingViewA(false);
    }, 3000)

    return () => clearTimeout(timer);
  }, []);

  if (showLandingViewA) {
    return (
      <View style={[styles.container, { backgroundColor: colors.darkBackground }]}>
        <MaterialCommunityIcons name="finance" size={64} color={colors.textLight} />
        <Text style={[styles.text, { color: colors.textLight }]}>
          Goal Wealth
        </Text>
        <ActivityIndicator size="large" style={styles.loading} color={colors.textLight} />
      </View>
    )
  }

  return (
    // View B
    <View style={[styles.container, { backgroundColor: colors.primaryLight }]}>
      <MaterialCommunityIcons name="finance" size={64} color={colors.darkBackground} />
      <Text style={[styles.text, { color: colors.darkBackground }]}>
        Goal Wealth
      </Text>
      <Text style={styles.textDescription}>
        Your smart personal Finance AI Companion UI Kit
      </Text>
      {/* <ThemeButton title="Login" onPress={()=>{}} colorBackground={colors.background} colorText={colors.textLight} />
        <ThemeButton title="Sign up" onPress={()=>{}} colorBackground={colors.background} colorText={colors.textLight} />
        <Pressable style={{ marginTop: 4 }}>
          <Text style={[styles.textNote, {color: colors.text}]} >
            Forgort password?
          </Text>
        </Pressable> */}
      <View style={styles.subContainer}>
        <UnorderedList items={broadcasting} />
      </View>
      <ThemeButton title="Get Started" onPress={() => {
        navigation.navigate("(auth)" as never);
      }} colorBackground={colors.darkBackground} colorText={colors.textLight} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  subContainer: {
    marginTop: 24,
    marginBottom: 24
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
  textDescription: {
    fontSize: 18,
    fontWeight: "200",
    color: Colors.light.text,
    paddingLeft: 8,
    paddingRight: 8,
    textAlign: "center"
  },
  textNote: {
    fontSize: 12,
    fontWeight: "bold",
  },
  loading: {
    marginTop: 12,
  }
})