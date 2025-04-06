import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";

interface UseFetchArticleImagesResult {
    images: string[];
    loading: boolean;
    error: string;
}

const useFetchArticleImages = (articleId: string, maxAmount: number | null = null): UseFetchArticleImagesResult => {
    const [cookies] = useCookies(['jwt']);
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const jwt = cookies.jwt;

    useEffect(() => {
        if (!jwt || !articleId) {
            return;
        }

        const fetchImages = async () => {
            setLoading(true);
            try {
                let href = `http://${import.meta.env.VITE_API_URL}/feed/article_images?article_id=${articleId}`;
                if (maxAmount) {
                    href += `&max_amount=${maxAmount}`;
                }
                const response = await fetch(
                    href,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'authorization': `Bearer ${jwt}`,
                        },
                    }
                );
                if (!response.ok) {
                    throw new Error("Ошибка при получении изображений статьи");
                }
                const data = await response.json();
                setImages(data.images);
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

        fetchImages();
    }, [articleId, jwt, maxAmount]);

    return { images, loading, error };
};

export default useFetchArticleImages;
