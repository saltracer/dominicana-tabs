import React from 'react';
import { Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdminGuard from '../../components/AdminGuard';
import { useTheme } from '../../components/ThemeProvider';
import { Colors } from '../../constants/Colors';

export default function AdminLayout() {
  const { colorScheme } = useTheme();

  return (
    <AdminGuard>
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
          // headerTitleStyle: {
          //   fontFamily: 'System',
          //   fontWeight: '700',
          // },
          //headerBackTitle: 'Back',
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Admin Dashboard',
            headerLargeTitle: false,
            headerLeft: () => (
              <TouchableOpacity 
                onPress={() => router.back()}
                style={{ marginLeft: 15 }}
                activeOpacity={0.6}
              >
                <Ionicons name="chevron-back" size={28} color={Colors[colorScheme ?? 'light'].text} />
              </TouchableOpacity>
            ),
          }} 
        />
        <Stack.Screen 
          name="books/index" 
          options={{ title: 'Manage Books' }} 
        />
        <Stack.Screen 
          name="books/[id]" 
          options={{ title: 'Edit Book' }} 
        />
        <Stack.Screen 
          name="books/new" 
          options={{ title: 'Add New Book' }} 
        />
        <Stack.Screen 
          name="users/index" 
          options={{ title: 'Manage Users' }} 
        />
        <Stack.Screen 
          name="users/[id]" 
          options={{ title: 'Edit User' }} 
        />
        <Stack.Screen 
          name="users/roles" 
          options={{ title: 'Manage Roles' }} 
        />
        <Stack.Screen 
          name="lists/index" 
          options={{ title: 'Manage Lists' }} 
        />
        <Stack.Screen 
          name="lists/[listTypeId]" 
          options={{ title: 'List Items' }} 
        />
        <Stack.Screen 
          name="rosary/index" 
          options={{ title: 'Rosary Audio' }} 
        />
        <Stack.Screen 
          name="rosary/upload" 
          options={{ title: 'Upload Audio' }} 
        />
      </Stack>
    </AdminGuard>
  );
}

