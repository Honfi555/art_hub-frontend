import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useFetchArticles, { ArticleData } from "../../hooks/useFetchArticles";
import ArticlePreview from "./ArticlePreview";
import stylesheet from "./Feed.module.css";

const Feed = () => {
    const navigate = useNavigate();
    const { articles, error, loading } = useFetchArticles();

    useEffect(() => {
        if (error === 'Отсутствует JWT токен. Пожалуйста, выполните вход.') {
            navigate('/auth/login');
        }
    }, [error, navigate]);

    return (
        <main className={stylesheet.feedForm}>
            <h2 className={stylesheet.feedTittle}>Лента</h2>
            {loading && <p className={stylesheet.loadingMessage}>Загрузка...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <section className={stylesheet.scrollFeed}>
                {articles.length > 0 ? (
                    articles.map((article: ArticleData) => (
                        <ArticlePreview key={article.id} article={article} />
                    ))
                ) : (
                    !loading && <p className={stylesheet.emptyScrollFeedText}>Нет статей для отображения.</p>
                )}
            </section>
        </main>
    );
};

export default Feed;
