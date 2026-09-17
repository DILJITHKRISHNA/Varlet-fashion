import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Search, Heart, User, LayoutDashboard, Package, ClipboardList, Store } from 'lucide-react-native';
import { useAuthStore, isShopRole, isPlatformAdmin } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';

import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPVerifyScreen from '../screens/auth/OTPVerifyScreen';
import AdminLoginScreen from '../screens/auth/AdminLoginScreen';
import AdminRegisterScreen from '../screens/auth/AdminRegisterScreen';
import FeedScreen from '../screens/consumer/FeedScreen';
import SearchScreen from '../screens/consumer/SearchScreen';
import WishlistScreen from '../screens/consumer/WishlistScreen';
import ProfileScreen from '../screens/consumer/ProfileScreen';
import ProductDetailScreen from '../screens/consumer/ProductDetailScreen';
import NotificationsScreen from '../screens/consumer/NotificationsScreen';
import InspirationScreen from '../screens/consumer/InspirationScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import {
  AdminShopsScreen,
  AdminProductsScreen,
  AdminUsersScreen,
  AdminPromotionsScreen,
  AdminBannersScreen,
} from '../screens/admin/AdminManagementScreens';
import ShopDashboardScreen from '../screens/shop/ShopDashboardScreen';
import ShopProductsScreen from '../screens/shop/ShopProductsScreen';
import ShopPromotionsScreen from '../screens/shop/ShopPromotionsScreen';
import ShopOrdersScreen from '../screens/shop/ShopOrdersScreen';
import ShopStaffScreen from '../screens/shop/ShopStaffScreen';
import ShopAnalyticsScreen from '../screens/shop/ShopAnalyticsScreen';
import ShopStoreProfileScreen from '../screens/shop/ShopStoreProfileScreen';
import ShopSettingsScreen from '../screens/shop/ShopSettingsScreen';
import PlaceholderScreen from '../screens/misc/PlaceholderScreen';
import ShopProfileScreen from '../screens/consumer/ShopProfileScreen';

const AuthStack = createStackNavigator();
const ConsumerStack = createStackNavigator();
const AdminStack = createStackNavigator();
const ShopStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const ShopTab = createBottomTabNavigator();

function ConsumerTabs() {
  const { colors, layout, fonts } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.foregroundMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: layout.tabBarHeight,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', fontFamily: fonts.medium },
      }}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarIcon: ({ color, size }) => <Search size={size} color={color} /> }} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} options={{ tabBarIcon: ({ color, size }) => <Heart size={size} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <User size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

function ShopTabs() {
  const { colors, layout, fonts } = useTheme();

  return (
    <ShopTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.foregroundMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: layout.tabBarHeight,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', fontFamily: fonts.medium },
      }}
    >
      <ShopTab.Screen name="ShopHome" component={ShopDashboardScreen} options={{ tabBarLabel: 'Dashboard', tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} /> }} />
      <ShopTab.Screen name="ShopProductsTab" component={ShopProductsScreen} options={{ tabBarLabel: 'Products', tabBarIcon: ({ color, size }) => <Package size={size} color={color} /> }} />
      <ShopTab.Screen name="ShopOrdersTab" component={ShopOrdersScreen} options={{ tabBarLabel: 'Orders', tabBarIcon: ({ color, size }) => <ClipboardList size={size} color={color} /> }} />
      <ShopTab.Screen name="ShopSettingsTab" component={ShopSettingsScreen} options={{ tabBarLabel: 'Store', tabBarIcon: ({ color, size }) => <Store size={size} color={color} /> }} />
    </ShopTab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="OTPVerify" component={OTPVerifyScreen} />
      <AuthStack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <AuthStack.Screen name="ForgotPassword" component={PlaceholderScreen} initialParams={{ title: 'Forgot Password' }} />
      <AuthStack.Screen name="AdminRegister" component={AdminRegisterScreen} />
    </AuthStack.Navigator>
  );
}

function ConsumerNavigator() {
  return (
    <ConsumerStack.Navigator screenOptions={{ headerShown: false }}>
      <ConsumerStack.Screen name="MainTabs" component={ConsumerTabs} />
      <ConsumerStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <ConsumerStack.Screen name="Notifications" component={NotificationsScreen} />
      <ConsumerStack.Screen name="Inspiration" component={InspirationScreen} />
      <ConsumerStack.Screen name="ShopProfile" component={ShopProfileScreen} />
    </ConsumerStack.Navigator>
  );
}

function ShopNavigator() {
  return (
    <ShopStack.Navigator screenOptions={{ headerShown: false }}>
      <ShopStack.Screen name="ShopMainTabs" component={ShopTabs} />
      <ShopStack.Screen name="ShopProducts" component={ShopProductsScreen} />
      <ShopStack.Screen name="ShopPromotions" component={ShopPromotionsScreen} />
      <ShopStack.Screen name="ShopStaff" component={ShopStaffScreen} />
      <ShopStack.Screen name="ShopAnalytics" component={ShopAnalyticsScreen} />
      <ShopStack.Screen name="ShopStoreProfile" component={ShopStoreProfileScreen} />
    </ShopStack.Navigator>
  );
}

function AdminNavigator() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <AdminStack.Screen name="AdminShops" component={AdminShopsScreen} />
      <AdminStack.Screen name="AdminProducts" component={AdminProductsScreen} />
      <AdminStack.Screen name="AdminPromotions" component={AdminPromotionsScreen} />
      <AdminStack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <AdminStack.Screen name="AdminBanners" component={AdminBannersScreen} />
    </AdminStack.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, role } = useAuthStore();

  if (!isAuthenticated) return <AuthNavigator />;
  if (role === 'consumer') return <ConsumerNavigator />;
  if (isShopRole(role)) return <ShopNavigator />;
  if (isPlatformAdmin(role)) return <AdminNavigator />;
  return <AuthNavigator />;
}
