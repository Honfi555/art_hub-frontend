import { useState } from "react";
import { useCookies } from "react-cookie";

const useUploadArticleImages = () => {
    const [cookies] = useCookies(["jwt"]);
    const jwt = cookies.jwt;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const uploadImages = async (articleId: number, images: string[]): Promise<void> => {
        if (!jwt) {
            setError("Отсутствует JWT токен. Пожалуйста, выполните вход.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`http://${import.meta.env.VITE_API_URL}/feed/add_images`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${jwt}`
                },
                body: JSON.stringify({ article_id: articleId, images })
            });
            if (!response.ok) {
                throw new Error("Ошибка при загрузке изображений");
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Произошла неизвестная ошибка при загрузке изображений");
            }
        } finally {
            setLoading(false);
        }
    };

    return { uploadImages, loading, error };
};

export default useUploadArticleImages;
