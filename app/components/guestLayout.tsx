import { useRouter } from "next/router"
import { ReactNode } from "react"
import useAuth from "../hooks/useAuth"


interface Props {
    children : ReactNode
}

const GuestLayout = ({ children } : Props) => {
    const router = useRouter();
    const { user ,error , loading } = useAuth();

    if(user) {
        router.push('/panel');
        return <></>
    }

    return (
        <div className="w-full text-2xl">
            {children}
        </div>
    )
} 


export default GuestLayout;