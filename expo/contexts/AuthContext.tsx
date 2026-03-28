import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { User } from '@/types';

const DEFAULT_ADMIN: User = {
  id: 'admin-default',
  username: 'admin1',
  password: 'admin1',
  role: 'admin',
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('users');
      if (!stored) {
        const initialUsers = [DEFAULT_ADMIN];
        await AsyncStorage.setItem('users', JSON.stringify(initialUsers));
        return initialUsers;
      }
      return JSON.parse(stored) as User[];
    },
  });

  const currentUserQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem('currentUser');
      return stored ? JSON.parse(stored) : null;
    },
  });

  useEffect(() => {
    if (currentUserQuery.data !== undefined) {
      setCurrentUser(currentUserQuery.data);
      setIsReady(true);
    }
  }, [currentUserQuery.data]);

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const users = usersQuery.data || [];
      const user = users.find(u => u.username === username && u.password === password);
      
      if (!user) {
        throw new Error('Username atau password salah');
      }

      await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    },
    onSuccess: (user) => {
      setCurrentUser(user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const users = usersQuery.data || [];
      
      if (users.find(u => u.username === username)) {
        throw new Error('Username sudah digunakan');
      }

      const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        password,
        role: 'user',
      };

      const updatedUsers = [...users, newUser];
      await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
      await AsyncStorage.setItem('currentUser', JSON.stringify(newUser));
      
      return newUser;
    },
    onSuccess: (user) => {
      setCurrentUser(user);
      usersQuery.refetch();
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem('currentUser');
    },
    onSuccess: () => {
      setCurrentUser(null);
    },
  });

  return {
    currentUser,
    isReady,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error?.message,
    registerError: registerMutation.error?.message,
  };
});
