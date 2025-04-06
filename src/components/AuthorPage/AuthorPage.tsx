import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useCookies } from "react-cookie";
import useFetchArticles from "../../hooks/useFetchArticles";
import ArticlePreview from "../Feed/ArticlePreview";
import authorStylesheet from "./AuthorPage.module.css";
import feedStylesheet from "../Feed/Feed.module.css";

interface AuthorInfo {
    id: number;
    authorName: string;
    description: string;
}

const AuthorPage = () => {
    const navigate = useNavigate();
    const { authorName } = useParams();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [authorInfo, setAuthorInfo] = useState<AuthorInfo[]>([]);
    const [cookies] = useCookies(['jwt']);

    const {
        articles: authorArticles,
        error: articlesError,
        loading: articlesLoading
    } = useFetchArticles(authorName);

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
                    `http://${import.meta.env.VITE_API_URL}/users/author?author_name=${authorName}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': `Bearer ${cookies.jwt}`
                        },
                    });
                if (!response.ok) {
                    throw new Error('Ошибка при получении данных автора');
                }
                const data = await response.json();
                // Формат ответа: { author_info: [id, "authorName", "description"] }
                const authorData = data.author_info;
                setAuthorInfo([{
                    id: authorData[0],
                    authorName: authorData[1],
                    description: authorData[2]
                }]);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Произошла неизвестная ошибка');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAuthorInfo();
    }, [cookies.jwt, navigate, authorName]);

    // Если отсутствует JWT, перенаправляем на страницу входа
    useEffect(() => {
        if (articlesError === 'Отсутствует JWT токен. Пожалуйста, выполните вход.') {
            navigate('/auth/login');
        }
    }, [articlesError, navigate]);

    return (
        <main className={authorStylesheet.authorPage}>
            {loading && <p>Загрузка...</p>}
            {error && <p>{error}</p>}

            {/* Информация об авторе */}
            {!loading && !error && authorInfo.length > 0 && (
                <section className={authorStylesheet.authorInfo}>
                    <h1>Информация об авторе</h1>
                    <p><strong>Имя:</strong> {authorInfo[0].authorName}</p>
                    <p><strong>Описание:</strong> {authorInfo[0].description}</p>
                </section>
            )}

            {/* Статьи автора */}
            {articlesLoading && <p>Загрузка статей...</p>}
            {articlesError && <p style={{color: 'red'}}>{articlesError}</p>}
            {!articlesLoading && !articlesError && (
                <section className={feedStylesheet.scrollFeed}>
                    <h2>Статьи автора</h2>
                    {authorArticles.length > 0 ? (
                        authorArticles.map(article => (
                            <ArticlePreview key={article.id} article={article} />
                        ))
                    ) : (
                        <p>У автора пока нет статей.</p>
                    )}
                </section>
            )}
        </main>
    );
};

export default AuthorPage;
