import { useState } from 'react';
import useFetchArticles, { ArticleData } from '../../hooks/useFetchArticles';
import { FeedView } from './FeedView';

interface FeedContainerProps {
    authorName?: string;
}

export default function FeedContainer({ authorName }: FeedContainerProps) {
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const { articles, loading, error, isEmpty } = useFetchArticles(pageSize, page, authorName);

    return (
        <FeedView<ArticleData>
            title={authorName ? `Лента автора: ${authorName}` : 'Лента'}
            items={articles}
            pageSize={pageSize}
            loading={loading}
            error={error}
            isEmpty={isEmpty}
            fetchNextPage={() => setPage(p => p + 1)}
            mapItemToPreviewProps={item => ({
                id: item.id,
                title: item.title,
                author: item.userName,
                announcement: item.announcement
            })}
        />
    );
}

