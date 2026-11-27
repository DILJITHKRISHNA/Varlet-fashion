import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getOutfits } from '../../services/api';
import type { Outfit } from '../../services/mockData';

export default function InspirationScreen({ navigation }: any) {
  const { colors, borderRadius } = useTheme();
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  useEffect(() => {
    getOutfits().then(setOutfits).catch((e) => console.warn('Failed to load outfits', e));
  }, []);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.surface },
    title: { fontSize: 24, fontWeight: '700', color: colors.foreground },
    sub: { fontSize: 14, color: colors.foregroundMuted, marginTop: 2 },
    content: { padding: 16, paddingBottom: 100 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.foreground, marginBottom: 14, marginTop: 8 },
    card: {
      marginBottom: 16, borderRadius: borderRadius['2xl'], overflow: 'hidden',
      backgroundColor: colors.surface,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    },
    img: { width: '100%', height: 260, resizeMode: 'cover' },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 260, justifyContent: 'flex-end' },
    info: { padding: 16 },
    outfitStyle: { fontSize: 11, fontWeight: '700', color: '#FF6B35', textTransform: 'uppercase', letterSpacing: 1 },
    outfitTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginTop: 2 },
    tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
    tag: { paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: borderRadius.full },
    tagText: { fontSize: 11, color: '#fff', fontWeight: '600' },
    savedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4 },
    savedLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    savedText: { fontSize: 12, color: colors.foregroundMuted },
    viewBtn: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: colors.accentSoft, borderRadius: borderRadius.full },
    viewBtnText: { fontSize: 12, fontWeight: '700', color: '#FF6B35' },
  });

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Outfit Inspiration</Text>
        <Text style={s.sub}>Curated looks for every occasion</Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.sectionTitle}>Trending This Week</Text>
        {outfits.map(outfit => (
          <TouchableOpacity key={outfit.id} style={s.card} activeOpacity={0.92}>
            <View>
              <Image source={{ uri: outfit.image }} style={s.img} />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={s.overlay}>
                <View style={s.info}>
                  <Text style={s.outfitStyle}>{outfit.style}</Text>
                  <Text style={s.outfitTitle}>{outfit.title}</Text>
                  <View style={s.tagsRow}>
                    {outfit.tags.map(t => <View key={t} style={s.tag}><Text style={s.tagText}>#{t}</Text></View>)}
                  </View>
                </View>
              </LinearGradient>
            </View>
            <View style={s.savedRow}>
              <View style={s.savedLeft}>
                <Heart size={12} color={colors.foregroundMuted} fill={colors.foregroundMuted} />
                <Text style={s.savedText}>{outfit.savedCount.toLocaleString()} people saved this</Text>
              </View>
              <View style={s.viewBtn}><Text style={s.viewBtnText}>Shop Look →</Text></View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
