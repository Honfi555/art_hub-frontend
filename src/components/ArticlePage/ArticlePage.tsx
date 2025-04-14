import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import articleStylesheet from "./ArticlePage.module.css";
import feedStylesheet from "../Feed/Feed.module.css";
import useFetchArticleImages from "../../hooks/useFetchArticleImages";

interface ArticleData {
    id: number;
    title: string;
    userName: string;
    articleBody: string;
}

const ArticlePage = () => {
    const { articleId } = useParams();
    const navigate = useNavigate();
    const [cookies] = useCookies(['jwt']);
    const jwt = cookies.jwt;

    const [article, setArticle] = useState<ArticleData | null>(null);
    const [error, setError] = useState('');
    const [loadingArticle, setLoadingArticle] = useState(false);

    const { images, loading: loadingImages, error: imagesError } = useFetchArticleImages(articleId || "");

    useEffect(() => {
        if (!jwt) {
            setError("Отсутствует JWT токен. Пожалуйста, выполните вход.");
            navigate("/auth/login");
            return;
        }
        if (!articleId) {
            setError("Не указан ID статьи");
            return;
        }

        const fetchArticle = async () => {
            setLoadingArticle(true);
            try {
                const response = await fetch(`http://${import.meta.env.VITE_API_URL}/feed/article?article_id=${articleId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${jwt}`
                    },
                });
                if (!response.ok) {
                    throw new Error('Ошибка при получении данных статьи');
                }
                const data = await response.json();
                const articleData = data.article;
                setArticle({
                    id: articleData[0],
                    title: articleData[1],
                    userName: articleData[2],
                    articleBody: articleData[3],
                });
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Произошла неизвестная ошибка');
                }
            } finally {
                setLoadingArticle(false);
            }
        };

        fetchArticle();
    }, [jwt, articleId, navigate]);

    if (loadingArticle || loadingImages) {
        return <p>Загрузка...</p>;
    }

    if (error || imagesError) {
        return <p style={{ color: 'red' }}>{error || imagesError}</p>;
    }

    if (!article) {
        return <p>Статья не найдена.</p>;
    }

    return (
        <main className={articleStylesheet.articlePage}>
            <article className={articleStylesheet.article}>
                <h1 className={feedStylesheet.articleTitle}>{article.title}</h1>
                <p className={feedStylesheet.articleContent}>{article.articleBody}</p>
                <p className={feedStylesheet.articleAuthor}>
                    Автор:{" "}
                    <Link to={`/author/${article.userName}`} className={feedStylesheet.authorHref}>
                        {article.userName}
                    </Link>
                </p>
                {images.length > 0 ? (
                    <section className={articleStylesheet.articleImages}>
                        {images.map((img, index) => (
                            <img
                                key={index}
                                src={img.imageUrl}
                                alt={`Изображение ${index + 1}`}
                            />
                        ))}
                    </section>
                ) : (
                    <></>
                )}
            </article>
        </main>
    );
};

export default ArticlePage;
