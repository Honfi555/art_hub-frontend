import {useEffect, useState, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import ArticlePreview from './ArticlePreview';
import Loading from '../Loading/Loading';
import stylesheet from './Feed.module.css';

export interface FeedViewProps<T> {
    title: string;
    items: T[];
    pageSize: number;
    loading: boolean;
    error: string | null;
    isEmpty: boolean;
    fetchNextPage: () => void;
    mapItemToPreviewProps: (item: T) => { id: number; title: string; author: string; announcement: string; score?: number };
}

export function FeedView<T>({
                                title,
                                items,
                                pageSize,
                                loading,
                                error,
                                isEmpty,
                                fetchNextPage,
                                mapItemToPreviewProps,
                            }: FeedViewProps<T>) {
    const navigate = useNavigate();
    const [allItems, setAllItems] = useState<T[]>([]);
    const [hasMore, setHasMore] = useState(true);

    // когда бек больше не отдаёт
    useEffect(() => {
        if (isEmpty) setHasMore(false);
    }, [isEmpty]);

    // при ошибке JWT
    useEffect(() => {
        if (error === 'Отсутствует JWT токен. Пожалуйста, выполните вход.') {
            navigate('/auth/login');
        }
    }, [error, navigate]);

    // накатить новую страницу в общий массив
    useEffect(() => {
        if (items.length > 0) {
            setAllItems(prev => [...prev, ...items]);
            if (items.length < pageSize) setHasMore(false);
        }
    }, [items, pageSize]);

    // инфинити‑скролл
    const onScroll = useCallback(() => {
        if (!hasMore) return;
        const {scrollY, innerHeight} = window;
        const {scrollHeight} = document.documentElement;
        if (scrollHeight - scrollY <= innerHeight + 100) {
            fetchNextPage();
        }
    }, [hasMore, fetchNextPage]);

    useEffect(() => {
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [onScroll]);

    return (
        <main className={stylesheet.feedForm}>
            <h2 className={stylesheet.feedTittle}>{title}</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <section className={stylesheet.scrollFeed}>
                {allItems.length > 0 ? (
                    allItems.map(item => {
                        const props = mapItemToPreviewProps(item);
                        return <ArticlePreview key={props.id} article={props}/>;
                    })
                ) : (
                    !loading && <p className={stylesheet.emptyScrollFeedText}>Нет статей для отображения.</p>
                )}
            </section>
            <Loading loading={loading} />
        </main>
    );
}
