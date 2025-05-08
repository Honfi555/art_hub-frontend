import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

export interface ArticleData {
    id: number;
    title: string;
    userName: string;
    announcement: string;
    articleBody: string;
}

const useArticleData = (articleId?: string) => {
    const [article, setArticle] = useState<ArticleData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cookies] = useCookies(["jwt"]);
    const jwt = cookies.jwt;
    const navigate = useNavigate();

    useEffect(() => {
        if (!articleId) return;

        if (!jwt) {
            setError("Отсутствует JWT токен. Пожалуйста, выполните вход.");
            navigate("/auth/login");
            return;
        }

        const fetchArticle = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/feed/article_full?article_id=${articleId}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            authorization: `Bearer ${jwt}`
                        }
                    }
                );
                if (!response.ok) {
                    throw new Error("Ошибка при получении данных статьи");
                }
                const data = await response.json();

                const articleData: ArticleData = {
                    id: data.article[0],
                    title: data.article[1],
                    userName: data.article[2],
                    announcement: data.article[3],
                    articleBody: data.article[4]
                };
                setArticle(articleData);
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

        fetchArticle();
    }, [articleId, jwt, navigate]);

    return { article, loading, error };
};

export default useArticleData;
