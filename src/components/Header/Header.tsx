import {Link} from "react-router-dom";
import {useCookies} from "react-cookie";
import stylesheet from "./Header.module.css";

const Header = () => {
    const [cookies] = useCookies(['login']);

    return (
        <header className={stylesheet.headerForm}>
            <div className={stylesheet.headerCompanyLogo}>
                <Link to={`/feed`} className={stylesheet.feedHref}>
                    <p>ArtHub</p>
                    <img src="/src/assets/icon.svg" alt="ArtHub"/>
                </Link>
            </div>
            <div className={stylesheet.headerUserAvatar}>
                {cookies.login ?
                    (
                        <Link to={`/author/${cookies.login}`} className={stylesheet.feedHref}>
                            <p>{cookies.login}</p>
                            <img
                                src="https://avatars.mds.yandex.net/i?id=9098ee8c7e854910f612d55b443bcaaec0e0cc8b-5088908-images-thumbs&n=13"
                                alt="User Avatar"
                            />
                        </Link>
                    ) : (<>
                        <p>Username</p>
                        <img
                            src="https://avatars.mds.yandex.net/i?id=9098ee8c7e854910f612d55b443bcaaec0e0cc8b-5088908-images-thumbs&n=13"
                            alt="User Avatar"
                        />

                    </>)}
                <Link to={'/auth/logout'} className={stylesheet.feedHref}>
                    <img src="/src/assets/icon-logout-32.png" alt="Logout btn" className={stylesheet.logout} />
                </Link>
            </div>
        </header>
    )
}

export default Header;