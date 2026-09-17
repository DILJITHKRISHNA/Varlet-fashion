import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { MOCK_SHOPS } from '../../services/mockData';
import ScreenHeader from '../../components/ui/ScreenHeader';
import Button from '../../components/ui/Button';

export default function ShopStoreProfileScreen({ navigation }: any) {
  const { colors, borderRadius, fonts } = useTheme();
  const { shopId } = useAuthStore();
  const shop = MOCK_SHOPS.find(s => s.id === shopId) ?? MOCK_SHOPS[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Store profile" onBack={() => navigation.goBack()} showLogout />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient colors={colors.gradientAccent} style={styles.cover} />
        <View style={{ padding: 20, marginTop: -32 }}>
          <Image source={{ uri: shop.logo }} style={[styles.logo, { borderRadius: borderRadius['2xl'], borderColor: colors.surface }]} />
          <Text style={[styles.name, { color: colors.foreground, fontFamily: fonts.semiBold }]}>{shop.name}</Text>
          <Text style={{ color: colors.foregroundMuted, fontFamily: fonts.regular }}>{shop.location} · {shop.category}</Text>
          <Text style={{ color: colors.foregroundMuted, marginTop: 12, lineHeight: 22, fontFamily: fonts.regular }}>{shop.description}</Text>
          <Button label="Edit store details" variant="outline" fullWidth style={{ marginTop: 24 }} onPress={() => {}} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cover: { height: 120 },
  logo: { width: 72, height: 72, borderWidth: 3, marginBottom: 12 },
  name: { fontSize: 22, fontWeight: '600' },
});
