import {useState, useEffect} from "react";
import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";

export interface ArticleSearchResult {
    article_id: number;
    title: string;
    login: string;
    announcement?: string;
    score: number;
}

interface UseSearchArticlesOptions {
    query: string;
    login?: string | null;
    amount?: number;
    chunk?: number;
    announcement?: boolean
}

const useSearchArticles = ({
                               query,
                               login = null,
                               amount = 5,
                               chunk = 1,
                               announcement = false,
                           }: UseSearchArticlesOptions) => {
    const [results, setResults] = useState<ArticleSearchResult[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [cookies] = useCookies(["jwt"]);
    const jwt = cookies.jwt;
    const navigate = useNavigate();
    let isEmpty: boolean = false;

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
                params.append("amount", amount?.toString());
                params.append("chunk", chunk?.toString());
                if (login) {
                    params.append("login", login);
                }
                params.append("announcement", `${announcement}`);

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

                if (payload.results.length === 0) isEmpty = true;

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
    }, [query, login, jwt, navigate, amount, chunk]);

    return {results, loading, error, isEmpty};
};

export default useSearchArticles;
