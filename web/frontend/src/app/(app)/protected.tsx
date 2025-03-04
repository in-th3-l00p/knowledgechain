"use client";

import React, {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "@/hooks/useAuth";

export default function Protected({ children }: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const {
        isAuthenticated,
        isLoading: authLoading,
    } = useAuth();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, authLoading, router]);

    return (
        <>
            {children}
        </>
    );
}