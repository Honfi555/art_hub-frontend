import {useState, useEffect} from "react";
import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";

export interface ArticleSearchResult {
    article_id: number;
    title: string;
    login: string;
    score: number;
}

interface UseSearchArticlesOptions {
    query: string;
    login?: string | null;
}

const useSearchArticles = ({
                               query,
                               login,
                           }: UseSearchArticlesOptions) => {
    const [results, setResults] = useState<ArticleSearchResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [cookies] = useCookies(["jwt"]);
    const jwt = cookies.jwt;
    const navigate = useNavigate();

    useEffect(() => {
        // Не дергаем, пока нет обязательного параметра
        if (!query) {
            setResults([]);
            return;
        }

        // Проверка JWT
        if (!jwt) {
            setError("Отсутствует JWT токен. Пожалуйста, выполните вход.");
            navigate("/auth/login");
            return;
        }

        const fetchSearch = async () => {
            setLoading(true);
            setError(null);

            try {
                // Составляем query string
                const params = new URLSearchParams();
                params.append("query", query);
                params.append("amount", String(5));
                params.append("chunk", String(1));
                if (login) {
                    params.append("login", login);
                }
                console.log(`login: ${login}; params: ${params}`);

                const url = `${import.meta.env.VITE_API_URL}/feed/search_articles?${params.toString()}`;
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`,
                    },
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(`Ошибка ${response.status}: ${text}`);
                }

                const payload = await response.json();
                if (!payload.success) {
                    throw new Error("Сервер вернул успех=false");
                }

                setResults(payload.results as ArticleSearchResult[]);
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

        fetchSearch();
    }, [query, login, jwt, navigate]);

    return {results, loading, error};
};

export default useSearchArticles;
