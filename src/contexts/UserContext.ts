// import { createContext, useContext, useEffect, useState } from 'react'
// import { useUser, useClerk } from '@clerk/clerk-react'

// interface UserContextType {
//   userId: string | null
//   email: string | null
//   isLoaded: boolean
//   isSignedIn: boolean
//   deleteAccount: () => Promise<void>
// }

// const UserContext = createContext<UserContextType | null>(null)

// export const UserProvider = ({ children }: { children: React.ReactNode }) => {
//   const { user, isLoaded, isSignedIn } = useUser()
//   const { signOut } = useClerk()

//   const [userId, setUserId]   = useState<string | null>(null)
//   const [email, setEmail]     = useState<string | null>(null)

//   useEffect(() => {
//     if (isLoaded && isSignedIn && user) {
//       setUserId(user.id)
//       setEmail(user.primaryEmailAddress?.emailAddress ?? null)
//     } else {
//       setUserId(null)
//       setEmail(null)
//     }
//   }, [isLoaded, isSignedIn, user])

//   const deleteAccount = async () => {
//     try {
//       await user?.delete()
//       await signOut()
//     } catch (err) {
//       console.error('Failed to delete account:', err)
//     }
//   }

//   return (
//     <UserContext.Provider value={{ userId, email, isLoaded, isSignedIn, deleteAccount }}>
//       {children}
//     </UserContext.Provider>
//   )
// }

// export const useUserContext = () => {
//   const ctx = useContext(UserContext)
//   if (!ctx) throw new Error('useUserContext must be used inside UserProvider')
//   return ctx
// }
