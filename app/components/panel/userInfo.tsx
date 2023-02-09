import { useRouter } from "next/router";
import { removeLoginToken } from "../../helpers/auth";
import { useAppSelector } from "../../hooks";
import useAuth from "../../hooks/useAuth";
import { selectUser } from "../../store/auth";



const UserInfo = () => {
    const user = useAppSelector(selectUser)
    const router = useRouter();

    const logoutHandler = async () => {
        await removeLoginToken();
        await router.push('/')
    }

    return (
        <>
            <span>username: </span>
            <h2>{user?.name}</h2>

            <button onClick={logoutHandler}>logout</button>
        </>
    )
}


export default UserInfo;