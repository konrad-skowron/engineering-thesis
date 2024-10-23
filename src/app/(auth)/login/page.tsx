'use client'
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    signInWithGoogle,
    signOut,
    onAuthStateChanged
} from "@/lib/auth";
import { User } from "firebase/auth";

function useUserSession(initialUser: User | null) {
    const [user, setUser] = useState<User | null>(initialUser);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged((authUser: User | null) => {
            setUser(authUser)
        })

        return () => unsubscribe()
    }, []);

    useEffect(() => {
        onAuthStateChanged((authUser: User | null) => {
            if (user === undefined) return

            if (user?.email !== authUser?.email) {
                router.refresh()
            }
        })
    }, [user, router]);

    return user;
}

export default function Login({ initialUser }: { initialUser: User | null }) {

    const user = useUserSession(initialUser);

    const handleSignOut = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        signOut();
    };

    const handleSignIn = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        signInWithGoogle();
    };

    return (
        <header>
            {user ? (
                <>
                    <div className="profile">
                        <div className="menu">
                            ...
                            <ul>
                                <li>{user.displayName}</li>
                                <li>
                                    <a href="#" onClick={handleSignOut}>
                                        Sign Out
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </>
            ) : (
                <div className="profile">
                    <a href="#" onClick={handleSignIn}>
                        <Image src="/profile.svg" alt="A placeholder user image" width={48} height={48} />
                        Sign In with Google
                    </a>
                </div>
            )}
        </header>
    );
}
