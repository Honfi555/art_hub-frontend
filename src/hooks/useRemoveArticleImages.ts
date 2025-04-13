import { useState } from "react";
import { useCookies } from "react-cookie";

const useRemoveArticleImages = () => {
    const [cookies] = useCookies(["jwt"]);
    const jwt = cookies.jwt;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const removeImages = async (imageIds: number[]): Promise<void> => {
        if (!jwt) {
            setError("Отсутствует JWT токен. Пожалуйста, выполните вход.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`http://${import.meta.env.VITE_API_URL}/feed/remove_images`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${jwt}`
                },
                body: JSON.stringify({ image_ids: imageIds })
            });
            if (!response.ok) {
                throw new Error("Ошибка при удалении изображений");
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Произошла неизвестная ошибка при удалении изображений");
            }
        } finally {
            setLoading(false);
        }
    };

    return { removeImages, loading, error };
};

export default useRemoveArticleImages;
