import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { getNotifications, markNotificationRead } from '../../services/api';
import type { Notification } from '../../services/mockData';

export default function NotificationsScreen({ navigation }: any) {
  const { colors, borderRadius } = useTheme();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    getNotifications(user.id).then(setNotifications).catch((e) => console.warn('Failed to load notifications', e));
  }, [user]);

  const openNotification = async (n: Notification) => {
    if (!n.isRead) {
      await markNotificationRead(n.id);
      setNotifications(prev => prev.map(x => (x.id === n.id ? { ...x, isRead: true } : x)));
    }
  };

  const TYPE_ICONS: Record<string, string> = {
    collection: '👗', promotion: '🏷️', shop_update: '🏪', recommendation: '✨', system: '⚙️',
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center' },
    back: { fontSize: 22, color: colors.foreground, marginRight: 14 },
    title: { fontSize: 22, fontWeight: '700', color: colors.foreground },
    content: { padding: 16, paddingBottom: 100 },
    notifCard: {
      flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.xl,
      padding: 14, marginBottom: 10,
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    },
    unread: { borderLeftWidth: 3, borderLeftColor: '#FF6B35' },
    iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    icon: { fontSize: 20 },
    content_: { flex: 1 },
    notifTitle: { fontSize: 14, fontWeight: '700', color: colors.foreground, marginBottom: 2 },
    notifBody: { fontSize: 13, color: colors.foregroundMuted, lineHeight: 18 },
    notifTime: { fontSize: 11, color: colors.foregroundSubtle, marginTop: 4 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF6B35', alignSelf: 'flex-start', marginTop: 4 },
    empty: { alignItems: 'center', paddingVertical: 80 },
    emptyEmoji: { fontSize: 48, marginBottom: 16 },
    emptyText: { fontSize: 16, fontWeight: '600', color: colors.foreground },
  });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60 / 60);
    if (diff < 1) return 'Just now';
    if (diff < 24) return `${diff}h ago`;
    return `${Math.floor(diff / 24)}d ago`;
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.title}>Notifications</Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {notifications.map(n => (
          <TouchableOpacity key={n.id} style={[s.notifCard, !n.isRead && s.unread]} onPress={() => openNotification(n)}>
            <View style={s.iconWrap}>
              <Text style={s.icon}>{TYPE_ICONS[n.type] ?? '🔔'}</Text>
            </View>
            <View style={s.content_}>
              <Text style={s.notifTitle}>{n.title}</Text>
              <Text style={s.notifBody}>{n.body}</Text>
              <Text style={s.notifTime}>{formatTime(n.createdAt)}</Text>
            </View>
            {!n.isRead && <View style={s.unreadDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
