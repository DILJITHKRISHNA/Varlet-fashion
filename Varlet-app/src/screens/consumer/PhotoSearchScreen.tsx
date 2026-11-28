import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus, Film, Sparkles, SearchX } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { searchByPhoto, type PhotoSearchResult } from '../../services/api';
import type { LocalFile } from '../../services/upload';
import ScreenHeader from '../../components/ui/ScreenHeader';
import Chip from '../../components/ui/Chip';
import StateView from '../../components/ui/StateView';
import PressableScale from '../../components/ui/PressableScale';
import ProductGrid from '../../components/ProductGrid';

// The same limits the server applies.
const MAX_IMAGE_MB = 8;
const MAX_VIDEO_MB = 12;
const BUDGETS = [
  { label: 'Any price', max: Infinity },
  { label: 'Under ₹1,000', max: 999 },
  { label: 'Under ₹2,000', max: 1999 },
  { label: 'Under ₹5,000', max: 4999 },
];

interface Picked extends LocalFile {
  isVideo: boolean;
}

export default function PhotoSearchScreen({ navigation }: any) {
  const { colors, borderRadius, fonts } = useTheme();
  const [picked, setPicked] = useState<Picked | null>(null);
  const [result, setResult] = useState<PhotoSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [slow, setSlow] = useState(false);
  const [budget, setBudget] = useState(BUDGETS[0]);
  const [brand, setBrand] = useState<string | null>(null);

  useEffect(() => {
    setSlow(false);
    if (!searching) return;
    const timer = setTimeout(() => setSlow(true), 12_000);
    return () => clearTimeout(timer);
  }, [searching]);

  const search = async (file: Picked) => {
    setSearching(true);
    setError(null);
    setResult(null);
    setBrand(null);
    setBudget(BUDGETS[0]);
    try {
      setResult(await searchByPhoto(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The search did not work. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const choose = async (kind: 'images' | 'videos') => {
    setError(null);
    try {
      const chosen = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [kind],
        quality: 0.7,
        videoMaxDuration: 60,
      });
      if (chosen.canceled) return;
      const asset = chosen.assets[0];
      const isVideo = kind === 'videos';
      const file: Picked = {
        uri: asset.uri,
        name: asset.fileName ?? (isVideo ? 'clip.mp4' : 'photo.jpg'),
        mimeType: asset.mimeType ?? (isVideo ? 'video/mp4' : 'image/jpeg'),
        size: asset.fileSize,
        file: asset.file,
        isVideo,
      };
      const limit = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
      if (file.size && file.size > limit * 1024 * 1024) {
        setPicked(null);
        setResult(null);
        setError(`That file is larger than ${limit} MB. Choose a ${isVideo ? 'shorter clip' : 'smaller picture'}.`);
        return;
      }
      setPicked(file);
      search(file);
    } catch {
      setError('Your photos could not be opened. Check the permission in your phone settings.');
    }
  };

  const brands = [...new Set((result?.results ?? []).map((r) => r.product.brand).filter(Boolean))];
  const shown = (result?.results ?? []).filter(
    (r) => r.product.price <= budget.max && (!brand || r.product.brand === brand)
  );
  const matchOf = new Map(shown.map((r) => [r.product.id, r.exact]));
  const muted = { color: colors.foregroundMuted, fontFamily: fonts.regular };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Photo search" subtitle="Screenshots, posts and reels" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.choices}>
          {[
            { kind: 'images' as const, icon: ImagePlus, title: 'Screenshot or photo', text: 'From a post, story or your camera roll' },
            { kind: 'videos' as const, icon: Film, title: 'Reel or video clip', text: `A saved clip up to ${MAX_VIDEO_MB} MB` },
          ].map(({ kind, icon: Icon, title, text }) => (
            <PressableScale
              key={kind}
              accessibilityRole="button"
              accessibilityLabel={title}
              disabled={searching}
              onPress={() => choose(kind)}
              style={[styles.choice, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: borderRadius['2xl'], opacity: searching ? 0.5 : 1 }]}
            >
              <View style={[styles.icon, { backgroundColor: colors.accentSoft }]}>
                <Icon size={22} color={colors.accent} />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.choiceTitle, { color: colors.foreground, fontFamily: fonts.semiBold }]}>{title}</Text>
                <Text style={[styles.small, muted]}>{text}</Text>
              </View>
            </PressableScale>
          ))}
        </View>

        {picked && !picked.isVideo && (
          <Image source={{ uri: picked.uri }} style={[styles.preview, { borderRadius: borderRadius['2xl'], backgroundColor: colors.surface }]} />
        )}
        {picked?.isVideo && <Text style={[styles.small, styles.fileName, muted]}>Clip: {picked.name}</Text>}

        {searching && (
          <StateView loading message={slow ? 'Still looking. This can take a minute…' : 'Looking for these pieces in shops…'} />
        )}

        {error && (
          <StateView
            error={error}
            title="Search didn't work"
            action={picked ? { label: 'Try again', onPress: () => search(picked) } : undefined}
          />
        )}

        {result && result.detected.length === 0 && (
          <StateView icon={SearchX} title="No clothing found" message="Try a clearer picture that shows the outfit." />
        )}

        {result && result.detected.length > 0 && (
          <>
            <View style={styles.spotted}>
              <Sparkles size={15} color={colors.accent} />
              <Text style={[styles.small, styles.flex, { color: colors.foreground, fontFamily: fonts.medium }]}>
                Spotted: {result.detected.map((d) => `${d.name}${d.colors[0] ? ` (${d.colors[0]})` : ''}`).join(', ')}
              </Text>
            </View>

            {result.results.length === 0 ? (
              <StateView icon={SearchX} title="No shop has this yet" message="Try another picture, or search by name." />
            ) : (
              <>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                  {BUDGETS.map((b) => (
                    <Chip key={b.label} label={b.label} selected={budget.label === b.label} onPress={() => setBudget(b)} />
                  ))}
                </ScrollView>
                {brands.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                    {brands.map((b) => (
                      <Chip key={b} label={b} selected={brand === b} onPress={() => setBrand(brand === b ? null : b)} />
                    ))}
                  </ScrollView>
                )}
                {shown.length ? (
                  <ProductGrid
                    products={shown.map((r) => r.product)}
                    navigation={navigation}
                    badgeFor={(p) =>
                      matchOf.get(p.id) ? { label: 'Exact match', strong: true } : { label: 'Similar', strong: false }
                    }
                  />
                ) : (
                  <StateView title="Nothing with these filters" message="Choose a different price or brand." />
                )}
              </>
            )}
          </>
        )}

        <Text style={[styles.note, { color: colors.foregroundSubtle, fontFamily: fonts.regular }]}>
          Instagram links can't be opened, so take a screenshot or save the clip first. Your picture is
          sent to Google's Gemini service to describe the clothes.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  choices: { gap: 12 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderWidth: 1 },
  icon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  choiceTitle: { fontSize: 15, marginBottom: 3 },
  small: { fontSize: 12, lineHeight: 17 },
  preview: { width: '100%', height: 260, marginTop: 16, resizeMode: 'contain' },
  fileName: { marginTop: 14 },
  spotted: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 14 },
  chips: { gap: 8, marginBottom: 12 },
  note: { fontSize: 11, lineHeight: 16, marginTop: 24 },
});
