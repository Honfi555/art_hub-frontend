import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {useCookies} from "react-cookie";

import TextareaAutosize from "react-textarea-autosize";
import AuthorContext from "../../contexts/AuthorContext.tsx";
import authorStylesheet from "./AuthorPage.module.css";
import Loading from "../Loading/Loading.tsx";
import FeedContainer from "../Feed/FeedContainer.tsx";

interface AuthorInfo {
    id: number;
    authorName: string;
    description: string;
}

const AuthorPage = () => {
    const navigate = useNavigate();
    const {authorName} = useParams<{ authorName: string }>();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [authorInfo, setAuthorInfo] = useState<AuthorInfo[]>([]);
    const [cookies] = useCookies(["jwt", "login"]);

    // Дополнительное состояние для редактирования описания
    const [editMode, setEditMode] = useState(false);
    const [newDescription, setNewDescription] = useState("");

    useEffect(() => {
        const fetchAuthorInfo = async () => {
            if (!cookies.jwt) {
                setError("Отсутствует JWT токен. Пожалуйста, выполните вход.");
                navigate("/auth/login");
                return;
            }
            if (!authorName) {
                setError("Имя автора не найдено в URL.");
                return;
            }
            setLoading(true);
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/users/author?author_name=${authorName}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            authorization: `Bearer ${cookies.jwt}`
                        }
                    }
                );
                if (!response.ok) {
                    throw new Error("Ошибка при получении данных автора");
                }
                const data = await response.json();
                // Формат ответа: { author_info: [id, "authorName", "description"] }
                const authorData = data.author_info;
                setAuthorInfo([
                    {
                        id: authorData[0],
                        authorName: authorData[1],
                        description: authorData[2]
                    }
                ]);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Произошла неизвестная ошибка");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAuthorInfo();
    }, [cookies.jwt, navigate, authorName]);

    // Обработчик клика по кнопке редактирования описания
    const handleUpdateBtnClick = () => {
        // подставляем текущее описание в поле редактирования
        if (authorInfo.length > 0) {
            setNewDescription(authorInfo[0].description);
        }
        setEditMode(true);
    };

    // Отмена редактирования профиля
    const handleCancelEdit = () => {
        setEditMode(false);
        setNewDescription("");
    };

    // Подтверждение редактирования описания профиля и отправка на сервер
    const handleAcceptEdit = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/users/update_description`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        authorization: `Bearer ${cookies.jwt}`
                    },
                    body: JSON.stringify({description: newDescription})
                }
            );
            if (!response.ok) {
                handleCancelEdit();
                return;
            }
            // Обновляем состояние с новым описанием
            setAuthorInfo((prev) => {
                if (prev.length > 0) {
                    const updatedInfo = [...prev];
                    updatedInfo[0] = {...updatedInfo[0], description: newDescription};
                    return updatedInfo;
                }
                return prev;
            });
            setEditMode(false);
        } catch (error: any) {
            console.error(error);
            setError(error.message);
        }
    };

    return (
        <AuthorContext.Provider value={{authorName}}>
            <main className={authorStylesheet.authorPage}>
                <Loading loading={loading} />
                {error && <p>{error}</p>}

                {/* Информация об авторе */}
                {!loading && !error && authorInfo.length > 0 && (
                    <section className={authorStylesheet.authorInfo}>
                        <h1>Информация об авторе</h1>
                        <div className={authorStylesheet.authorInfoContent}>
                            <p>
                                <strong>Имя:</strong> {authorInfo[0].authorName}
                            </p>
                            <div className={authorStylesheet.descriptionContainer}>
                                <strong className={authorStylesheet.descriptionStrong}>
                                    Описание:
                                    {authorName === cookies.login && !editMode && (
                                        <button className={authorStylesheet.updateDescriptionBtn}
                                                onClick={handleUpdateBtnClick}>
                                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15"
                                                 height="15"
                                                 viewBox="0 0 48 48">
                                                <path
                                                    d="M 36 5.0097656 C 34.205301 5.0097656 32.410791 5.6901377 31.050781 7.0507812 L 8.9160156 29.183594 C 8.4960384 29.603571 8.1884588 30.12585 8.0253906 30.699219 L 5.0585938 41.087891 A 1.50015 1.50015 0 0 0 6.9121094 42.941406 L 17.302734 39.974609 A 1.50015 1.50015 0 0 0 17.304688 39.972656 C 17.874212 39.808939 18.39521 39.50518 18.816406 39.083984 L 40.949219 16.949219 C 43.670344 14.228094 43.670344 9.7719064 40.949219 7.0507812 C 39.589209 5.6901377 37.794699 5.0097656 36 5.0097656 z M 36 7.9921875 C 37.020801 7.9921875 38.040182 8.3855186 38.826172 9.171875 A 1.50015 1.50015 0 0 0 38.828125 9.171875 C 40.403 10.74675 40.403 13.25325 38.828125 14.828125 L 36.888672 16.767578 L 31.232422 11.111328 L 33.171875 9.171875 C 33.957865 8.3855186 34.979199 7.9921875 36 7.9921875 z M 29.111328 13.232422 L 34.767578 18.888672 L 16.693359 36.962891 C 16.634729 37.021121 16.560472 37.065723 16.476562 37.089844 L 8.6835938 39.316406 L 10.910156 31.521484 A 1.50015 1.50015 0 0 0 10.910156 31.519531 C 10.933086 31.438901 10.975086 31.366709 11.037109 31.304688 L 29.111328 13.232422 z"></path>
                                            </svg>
                                        </button>
                                    )}
                                </strong>
                                {/* Показываем поле редактирования, если включён режим редактирования */}
                                {editMode ? (
                                    <>
                                        <TextareaAutosize
                                            value={newDescription}
                                            onChange={(e) => setNewDescription(e.target.value)}
                                            className={authorStylesheet.descriptionTextArea}
                                        />
                                        <div className={authorStylesheet.descriptionButtons}>
                                            <button onClick={handleAcceptEdit} className={authorStylesheet.descriptionButton}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20"
                                                     height="20" viewBox="0 0 48 48">
                                                    <path fill="#c8e6c9"
                                                          d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"></path>
                                                    <path fill="#4caf50"
                                                          d="M34.586,14.586l-13.57,13.586l-5.602-5.586l-2.828,2.828l8.434,8.414l16.395-16.414L34.586,14.586z"></path>
                                                </svg>
                                            </button>
                                            <button onClick={handleCancelEdit} className={authorStylesheet.descriptionButton}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20"
                                                     height="20" viewBox="0 0 48 48">
                                                    <path fill="#f44336"
                                                          d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"></path>
                                                    <path fill="#fff"
                                                          d="M29.656,15.516l2.828,2.828l-14.14,14.14l-2.828-2.828L29.656,15.516z"></path>
                                                    <path fill="#fff"
                                                          d="M32.484,29.656l-2.828,2.828l-14.14-14.14l2.828-2.828L32.484,29.656z"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <p className={authorStylesheet.descriptionText}>
                                        {authorInfo[0].description}
                                    </p>
                                )}
                            </div>
                        </div>
                        {authorName === cookies.login ? (
                            <button className={authorStylesheet.addArticleBtn} onClick={() => {
                                navigate('/article/add_article');
                            }}>
                                Добавить статью
                            </button>
                        ) : (
                            <></>
                        )}
                    </section>
                )}

                {/* Статьи автора */}
                <FeedContainer
                    authorName={authorName}
                />
            </main>
        </AuthorContext.Provider>
    );
};

export default AuthorPage;
