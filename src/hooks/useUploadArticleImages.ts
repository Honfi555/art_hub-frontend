import { useState } from "react";
import { useCookies } from "react-cookie";

interface UseUploadArticleImagesResult {
    uploadImages: (articleId: string, images: string[]) => Promise<string[]>;
    loading: boolean;
    error: string | null;
}

const useUploadArticleImages = (): UseUploadArticleImagesResult => {
    const [cookies] = useCookies(["jwt"]);
    const jwt = cookies.jwt;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadImages = async (
        articleId: string,
        images: string[]
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
            const url = `${base}/add_images?article_id=${articleId}`;
            const res = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
                // тело — чистый массив base64-строк
                body: JSON.stringify(images),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Ошибка ${res.status}: ${text || res.statusText}`);
            }

            const data = (await res.json()) as { created_image_ids: string[] };
            return data.created_image_ids;
        } catch (err: unknown) {
            const msg =
                err instanceof Error
                    ? err.message
                    : "Произошла неизвестная ошибка при загрузке изображений";
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    return { uploadImages, loading, error };
};

export default useUploadArticleImages;
