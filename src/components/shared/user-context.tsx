"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"

export type User = {
	id: number
	email: string
	role: string
	full_name: string
}

interface UserContextType {
	user: User | null
	setUser: (user: User | null) => void
	loading: boolean
	logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		async function fetchUser() {
			setLoading(true)
			try {
				const res = await fetch("/api/me")
				if (res.ok) {
					const data = await res.json()
					setUser(data.user)
				} else {
					setUser(null)
				}
			} catch {
				setUser(null)
			} finally {
				setLoading(false)
			}
		}
		fetchUser()
	}, [])

	// Add logout function to context
	async function logout() {
	await fetch("/api/auth/logout", { method: "POST" });
	setUser(null);
	document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	window.location.reload();
	}

	return (
		<UserContext.Provider value={{ user, setUser, loading, logout }}>
			{children}
		</UserContext.Provider>
	)
}

export function useUser() {
	const context = useContext(UserContext)
	if (!context) throw new Error("useUser must be used within a UserProvider")
	return context
}
