import { useState } from "react";
import { useCookies } from "react-cookie";

interface UseRemoveArticleImagesResult {
    removeImages: (articleId: string, imageIds: string[]) => Promise<string[]>;
    loading: boolean;
    error: string | null;
}

const useRemoveArticleImages = (): UseRemoveArticleImagesResult => {
    const [cookies] = useCookies(["jwt"]);
    const jwt = cookies.jwt;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const removeImages = async (
        articleId: string,
        imageIds: string[]
    ): Promise<string[]> => {
        if (!jwt) {
            const msg = "Отсутствует JWT токен. Пожалуйста, выполните вход.";
            setError(msg);
            throw new Error(msg);
        }

        setLoading(true);
        setError(null);

        try {
            const base = import.meta.env.VITE_IMAGES_URL;
            const url = `${base}/remove_images?article_id=${articleId}`;
            const res = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify(imageIds),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Ошибка ${res.status}: ${text || res.statusText}`);
            }

            const data = (await res.json()) as { deleted_image_ids: string[] };
            return data.deleted_image_ids;
        } catch (err: unknown) {
            const msg =
                err instanceof Error
                    ? err.message
                    : "Произошла неизвестная ошибка при удалении изображений";
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    return { removeImages, loading, error };
};

export default useRemoveArticleImages;
