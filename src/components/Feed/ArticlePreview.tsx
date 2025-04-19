import { FC } from "react";
import { Link } from "react-router-dom";
import useFetchArticleImages from "../../hooks/useFetchArticleImages.ts";
import stylesheet from "./Feed.module.css";

export interface ArticleData {
    id: number;
    title: string;
    userName: string;
    articleBody: string;
}

interface ArticlePreviewProps {
    article: ArticleData;
}

const ArticlePreview: FC<ArticlePreviewProps> = ({ article }) => {
    const { images, loading, error } = useFetchArticleImages(article.id.toString(), true);

    return (
        <article className={stylesheet.article}>
            <Link to={`/article/${article.id}`} className={stylesheet.articleTittleHref}>
                <h3 className={stylesheet.articleTittle}>{article.title}</h3>
            </Link>
            <p className={stylesheet.articleContent}>{article.articleBody}</p>
            <p className={stylesheet.articleAuthor}>
                Автор:{" "}
                <Link to={`/author/${article.userName}`} className={stylesheet.authorHref}>
                    {article.userName}
                </Link>
            </p>
            {loading ? (
                <p>Загрузка изображения...</p>
            ) : error ? (
                <p style={{ color: "red" }}>{error}</p>
            ) : images.length > 0 ? (
                <div>
                    <img
                        src={images[0].imageUrl}
                        alt={`Изображение статьи ${article.id}`}
                        className={stylesheet.articleImage}
                    />
                </div>
            ) : (
                <></>
            )}
        </article>
    );
};

export default ArticlePreview;
