import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";

interface Image {
    id: string;
    imageUrl: string;
}

interface UseFetchArticleImagesResult {
    images: Image[];
    loading: boolean;
    error: string | null;
}

/**
 * Хук для загрузки списка URL картинок по ID статьи.
 * @param articleId — ID статьи
 * @param announce — если true, вернётся только первая картинка
 */
const useFetchArticleImages = (
    articleId: string,
    announce: boolean = false
): UseFetchArticleImagesResult => {
    const [cookies] = useCookies(["jwt"]);
    const jwt = cookies.jwt;
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!articleId) return;
        if (!jwt) {
            setError("Отсутствует JWT токен. Пожалуйста, выполните вход.");
            return;
        }

        setImages([]);

        const fetchImages = async () => {
            setLoading(true);
            setError(null);

            try {
                const base = import.meta.env.VITE_IMAGES_URL;
                let url = `${base}/images/${articleId}`;
                if (announce) {
                    url += `?announce=true`;
                }

                const res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${jwt}`,
                    },
                });
                if (!res.ok) {
                    throw new Error(`Ошибка ${res.status}: ${res.statusText}`);
                }

                if (res.status === 204) {
                    return;
                }

                const data = (await res.json()) as { image_urls: string[] };
                const imgs: Image[] = data.image_urls.map((path) => {
                    const imageUrl = path.startsWith("http")
                        ? path
                        : `${base}${path}`;
                    const segments = path.split("/");
                    const id = segments[segments.length - 1];
                    return { id, imageUrl };
                });

                setImages(imgs);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Неизвестная ошибка");
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [articleId, announce, jwt]);

    return { images, loading, error };
};

export default useFetchArticleImages;
