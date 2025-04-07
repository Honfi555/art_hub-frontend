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
                    <svg width="50px" height="50px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<g opacity="0.5">
			<path d="M17.976 2.60214C18.4394 2.34255 18.742 2.17429 18.9825 2.07837C19.209 1.98805 19.3082 1.99265 19.3758 2.0102C19.4425 2.02754 19.5291 2.07058 19.6774 2.25703C19.8356 2.45593 20.0105 2.74753 20.2782 3.19747L21.3821 5.0525C21.6499 5.50257 21.8227 5.7951 21.921 6.02715C22.0133 6.24515 22.0063 6.33514 21.9904 6.39301C21.9741 6.45176 21.9326 6.53473 21.7385 6.68003C21.5329 6.83397 21.2316 7.004 20.7681 7.26366L16.8361 9.46618C16.3975 9.71185 16.1138 9.86953 15.889 9.95899C15.6784 10.0428 15.5925 10.0358 15.5381 10.0214C15.4837 10.007 15.4058 9.97072 15.2658 9.7942C15.1165 9.60582 14.9506 9.32925 14.6952 8.90007L13.5162 6.91881C13.2539 6.47796 13.0851 6.19212 12.989 5.96551C12.8987 5.7528 12.9059 5.66639 12.9206 5.61202C12.9354 5.55766 12.9729 5.47928 13.1589 5.33961C13.3569 5.1908 13.6479 5.02654 14.0984 4.77419L17.976 2.60214Z" fill="#1C274C"/>
			<path d="M6.62684 10.196L3.23194 12.0976C2.76839 12.3573 2.46708 12.5273 2.26148 12.6813C2.06741 12.8266 2.02586 12.9095 2.00964 12.9683C1.99365 13.0262 1.98667 13.1162 2.07902 13.3342C2.17732 13.5662 2.35007 13.8587 2.6179 14.3088C2.88564 14.7587 3.06048 15.0503 3.21868 15.2492C3.36698 15.4357 3.45364 15.4787 3.52035 15.4961C3.58788 15.5136 3.68707 15.5182 3.91358 15.4279C4.15411 15.332 4.45672 15.1637 4.92014 14.9041L8.29723 13.0124C8.13943 12.7877 7.97589 12.5128 7.79249 12.2046L7.1303 11.0918C6.93035 10.7558 6.75363 10.4589 6.62684 10.196Z" fill="#1C274C"/>
			</g>
			<path d="M8.63781 8.45066L12.087 6.51855C12.2139 6.78163 12.3907 7.07878 12.5908 7.41501L13.8049 9.45532C13.9881 9.7632 14.1516 10.038 14.3093 10.2626L12.7624 11.1291L16.9384 20.9181C17.1076 21.3147 16.919 21.7716 16.5171 21.9386C16.1153 22.1056 15.6524 21.9195 15.4832 21.5228L12.0002 13.3584L8.51729 21.5228C8.34809 21.9195 7.88517 22.1056 7.48332 21.9386C7.08147 21.7716 6.89287 21.3147 7.06207 20.9181L10.7594 12.251C10.357 12.4763 10.0901 12.6229 9.87649 12.7079C9.66589 12.7918 9.57996 12.7848 9.52559 12.7704C9.47122 12.756 9.39324 12.7197 9.25331 12.5432C9.10397 12.3548 8.93812 12.0782 8.68272 11.649L8.05567 10.5953C7.79333 10.1544 7.62455 9.8686 7.52838 9.64198C7.43811 9.42928 7.44527 9.34286 7.46003 9.2885C7.47478 9.23413 7.51236 9.15576 7.69827 9.01609C7.89635 8.86728 8.18731 8.70301 8.63781 8.45066Z" fill="#1C274C"/>
		</svg>
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
                    <img alt="Logout btn" className={stylesheet.logout} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAABmElEQVR4nO2bTWrDQAyFv1Vu4NBcpbTXa9I7tZu2gUKyaha9QNJrqBim4Jpx/pz59XsgMOMBaZ6eZFtgEARB+I8Z8Az8AJaJHYCViy04VhkceMiWMQg4OGf35IOHjhKCw5zlhmhxmQhACjDyg0oA9QDUBKmp1i6ESgCVACoBIsDUA1ATNPLDKWXOgS2wcdfBHKXCsbga4Kuz5xtYhHCUEkNxtdneuXu73vW8dgKaTubbrN951hY1E7AdyPZ8jBKsAgJGkWAFEXBK7leVgxVEQBASbCQB68Sj809PTBeVg40kwBLby0BcZ5NgNyIgR5xVDlYxAX0lbHwbRAD1KsD35lhdE3xN3QTfp/4YDIWhuE7J+izZl0rAzQ9fGgGT/xjaTv1zuPG82V0l+1IJYOojsWND0YszXzIBuGxvpjoWvylMBCAFGPlBJYB6AGqC1FRrpZTA2g05SLyWjADzOE6xJgJIpIAP4K23J8WaHoNEUsDBOWp/U8kFjy6mfQxny8Rj7WP2FIOAmSPhTwk52N4dPspvc4IgMBn8AnvwdxG9X2+PAAAAAElFTkSuQmCC" />
		</Link>
            </div>
        </header>
    )
}

export default Header;
