import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetchArticles, { ArticleData } from '../../hooks/useFetchArticles';
import ArticlePreview from './ArticlePreview';
import stylesheet from './Feed.module.css';

interface FeedProps {
    /** Заголовок ленты (по‑умолчанию "Лента") */
    title?: string;
    /** Имя автора для фильтра (undefined → все статьи) */
    author?: string;
    /** Размер страницы (по‑умолчанию 10) */
    pageSize?: number;
}

const Feed: React.FC<FeedProps> = ({
                                       title = 'Лента',
                                       author,
                                       pageSize = 10,
                                   }) => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [allArticles, setAllArticles] = useState<ArticleData[]>([]);
    const [hasMore, setHasMore] = useState(true);

    // Подставляем author при вызове
    const { articles, error, loading, isEmpty } = useFetchArticles(
        pageSize,
        page,
        author
    );

    // Когда бекенд скажет, что больше нет данных
    useEffect(() => {
        if (isEmpty) setHasMore(false);
    }, [isEmpty]);

    // Перехват ошибки авторизации
    useEffect(() => {
        if (error === 'Отсутствует JWT токен. Пожалуйста, выполните вход.') {
            navigate('/auth/login');
        }
    }, [error, navigate]);

    // Накатываем следующую порцию статей
    useEffect(() => {
        if (articles.length !== 0) {
            setAllArticles(prev => [...prev, ...articles]);
            if (articles.length < pageSize) {
                setHasMore(false);
            }
        }
    }, [articles, pageSize]);

    // Инфинити‑скролл
    const handleScroll = useCallback(() => {
        if (!hasMore) return;
        const scrollTop = window.scrollY;
        const clientHeight = window.innerHeight;
        const scrollHeight = document.documentElement.scrollHeight;
        if (scrollHeight - scrollTop <= clientHeight + 100) {
            setPage(prev => prev + 1);
        }
    }, [hasMore]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return (
        <main className={stylesheet.feedForm}>
            <h2 className={stylesheet.feedTittle}>{title}</h2>
            {loading && <p className={stylesheet.loadingMessage}>Загрузка...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <section className={stylesheet.scrollFeed}>
                {allArticles.length > 0 ? (
                    allArticles.map((article: ArticleData) => (
                        <ArticlePreview key={article.id} article={article} />
                    ))
                ) : (
                    !loading && (
                        <p className={stylesheet.emptyScrollFeedText}>
                            Нет статей для отображения.
                        </p>
                    )
                )}
            </section>
        </main>
    );
};

export default Feed;
