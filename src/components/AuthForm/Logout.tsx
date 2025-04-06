import { useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const Logout = () => {
    const navigate = useNavigate();
    const [, , removeCookie] = useCookies(["jwt", "login"]);

    useEffect(() => {
        removeCookie("jwt", { path: "/" });
        removeCookie("login", { path: "/" });

        navigate("/auth/login");
    }, [removeCookie, navigate]);

    return null;
};

export default Logout;