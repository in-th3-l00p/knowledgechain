import React, {useEffect} from "react";
import {useAuth} from "@/hooks/useAuth";
import {useRouter} from "next/navigation";

export default function AppLayout({ children }: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const {
        isAuthenticated,
        isLoading: authLoading,
    } = useAuth()

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, authLoading, router])


    return (
        {children}
    );
}