import { useState } from 'react';
import { useParams } from 'react-router-dom';
import useSearchArticles, { ArticleSearchResult } from '../../hooks/useSearchArticles';
import { FeedView } from './FeedView';

export default function SearchContainer() {
    const { query, author } = useParams<{ query?: string; author?: string }>();
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const login = author ?? null;

    const { results, loading, error, isEmpty } = useSearchArticles({
        query: query ?? '',
        login,
        amount: pageSize,
        chunk: page,
        announcement: true,
    });

    return (
        <FeedView<ArticleSearchResult>
            title={`Результаты поиска: «${query}»`}
            items={results}
            pageSize={pageSize}
            loading={loading}
            error={error}
            isEmpty={isEmpty}
            fetchNextPage={() => setPage(p => p + 1)}
            mapItemToPreviewProps={r => ({
                id: r.article_id,
                title: r.title,
                author: r.login,
                announcement: (r.announcement) ? r.announcement : '',
                score: r.score
            })}
        />
    );
}
