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
    const [cookies] = useCookies(['jwt', "login"]);
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
                const response = await fetch(`${import.meta.env.VITE_API_URL}/feed/article?article_id=${articleId}`, {
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
                <div className={feedStylesheet.articleTittleContainer}>
                    <h1 className={feedStylesheet.articleTitle}>{article.title}</h1>
                    {article.userName === cookies.login ? (
                        <button className={feedStylesheet.updateArticleBtn} onClick={() => navigate(`/article/update_article/${article.id}`)}>
                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                                 viewBox="0 0 48 48">
                                <path
                                    d="M 36 5.0097656 C 34.205301 5.0097656 32.410791 5.6901377 31.050781 7.0507812 L 8.9160156 29.183594 C 8.4960384 29.603571 8.1884588 30.12585 8.0253906 30.699219 L 5.0585938 41.087891 A 1.50015 1.50015 0 0 0 6.9121094 42.941406 L 17.302734 39.974609 A 1.50015 1.50015 0 0 0 17.304688 39.972656 C 17.874212 39.808939 18.39521 39.50518 18.816406 39.083984 L 40.949219 16.949219 C 43.670344 14.228094 43.670344 9.7719064 40.949219 7.0507812 C 39.589209 5.6901377 37.794699 5.0097656 36 5.0097656 z M 36 7.9921875 C 37.020801 7.9921875 38.040182 8.3855186 38.826172 9.171875 A 1.50015 1.50015 0 0 0 38.828125 9.171875 C 40.403 10.74675 40.403 13.25325 38.828125 14.828125 L 36.888672 16.767578 L 31.232422 11.111328 L 33.171875 9.171875 C 33.957865 8.3855186 34.979199 7.9921875 36 7.9921875 z M 29.111328 13.232422 L 34.767578 18.888672 L 16.693359 36.962891 C 16.634729 37.021121 16.560472 37.065723 16.476562 37.089844 L 8.6835938 39.316406 L 10.910156 31.521484 A 1.50015 1.50015 0 0 0 10.910156 31.519531 C 10.933086 31.438901 10.975086 31.366709 11.037109 31.304688 L 29.111328 13.232422 z"></path>
                            </svg>
                        </button> ) : (<></>)
                    }
                </div>
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
