import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

export interface ArticleData {
    id: number;
    title: string;
    userName: string;
    articleBody: string;
}

function useFetchArticles(amount?: number | null, chunk?: number | null, login?: string) {
    const [articles, setArticles] = useState<ArticleData[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [cookies] = useCookies(['jwt']);
    let isEmpty: boolean = false;

    useEffect(() => {
        const fetchData = async () => {
            if (!cookies.jwt) {
                // Если нет токена — можно отобразить ошибку или перенаправлять из компонента
                setError('Отсутствует JWT токен. Пожалуйста, выполните вход.');
                return;
            }

            setLoading(true);

            try {
                let url = `http://${import.meta.env.VITE_API_URL}/feed/articles`;

                let args= "?";

                if (login) args += `?login=${login}`;
                if (amount && chunk) args += `&amount=${amount}&chunk=${chunk}`;
                if (args != "?") url += args;

                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${cookies.jwt}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Ошибка при получении статей');
                }

                const data = await response.json();
                const mappedArticles = data.articles.map((item: ArticleData[]) => ({
                    id: item[0],
                    title: item[1],
                    userName: item[2],
                    articleBody: item[3],
                }));

                if (mappedArticles.length === 0) isEmpty = true;

                setArticles(mappedArticles);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Произошла неизвестная ошибка');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [login, cookies.jwt, amount, chunk]);

    return { articles, error, loading, isEmpty };
}

export default useFetchArticles;
