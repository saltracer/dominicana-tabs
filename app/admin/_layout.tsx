import React from 'react';
import { Stack } from 'expo-router';
import AdminGuard from '../../components/AdminGuard';
import { useTheme } from '../../components/ThemeProvider';
import { Colors } from '../../constants/Colors';

export default function AdminLayout() {
  const { colorScheme } = useTheme();

  return (
    <AdminGuard>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
          },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
          headerTitleStyle: {
            fontFamily: 'Georgia',
            fontWeight: '600',
          },
          headerBackTitle: 'Back',
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Admin Dashboard',
            headerLargeTitle: false,
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

