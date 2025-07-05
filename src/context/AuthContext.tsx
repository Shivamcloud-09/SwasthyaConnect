
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { LoaderCircle } from 'lucide-react';

type Role = 'user' | 'admin' | null;

type AuthContextType = {
  user: User | null;
  role: Role;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase is not configured, we are not loading and have no user.
    if (!auth) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Check for admin role
        if (db) {
            const hospitalsRef = collection(db, "hospitals");
            const q = query(hospitalsRef, where("adminUid", "==", currentUser.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                setRole('admin');
            } else {
                setRole('user');
            }
        } else {
            setRole('user'); // Default to user if db is not available
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { user, role, loading };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
