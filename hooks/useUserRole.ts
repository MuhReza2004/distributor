"use client";

import { auth } from "@/app/lib/firebase";
import { getUserById } from "@/app/services/user.service";
import { UserRole } from "@/app/types/user";
import { useEffect, useState } from "react";

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      const profile = await getUserById(user.uid);
      setRole(profile?.role ?? null);
      setLoading(false);
    };

    fetchRole();
  }, []);

  return { role, loading };
}
