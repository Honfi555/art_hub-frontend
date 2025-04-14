import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";

interface Image {
    id: number;
    imageUrl: string;
}

interface UseFetchArticleImagesResult {
    images: Image[];
    loading: boolean;
    error: string;
}

// Вспомогательная функция для поиска подмассива в Uint8Array
function findSubarray(buffer: Uint8Array, subarray: Uint8Array, start: number = 0): number {
    for (let i = start; i <= buffer.length - subarray.length; i++) {
        let found = true;
        for (let j = 0; j < subarray.length; j++) {
            if (buffer[i + j] !== subarray[j]) {
                found = false;
                break;
            }
        }
        if (found) return i;
    }
    return -1;
}

const useFetchArticleImages = (articleId: string, maxAmount: number | null = null): UseFetchArticleImagesResult => {
    const [cookies] = useCookies(["jwt"]);
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const jwt = cookies.jwt;

    useEffect(() => {
        if (!jwt || !articleId) {
            return;
        }

        const fetchImages = async () => {
            setLoading(true);
            let href = `http://${import.meta.env.VITE_API_URL}/feed/article_images?article_id=${articleId}`;
            if (maxAmount) {
                href += `&max_amount=${maxAmount}`;
            }
            try {
                const response = await fetch(href, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": `Bearer ${jwt}`,
                    },
                });
                if (!response.ok) {
                    throw new Error("Ошибка при получении изображений статьи");
                }
                if (!response.body) {
                    throw new Error("Нет ответа от сервера");
                }
                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");

                // Инициируем пустой буфер для накопления данных
                let buffer = new Uint8Array(0);
                // Определяем границу (boundary), которую использует сервер (например, "--frame")
                const boundaryText = "--frame";
                const boundary = new TextEncoder().encode(boundaryText);
                // Последовательность, обозначающая конец заголовков (два CRLF)
                const doubleCRLF = new TextEncoder().encode("\r\n\r\n");

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    // Прибавляем новый фрагмент к накопленному буферу
                    const tmp = new Uint8Array(buffer.length + value.length);
                    tmp.set(buffer);
                    tmp.set(value, buffer.length);
                    buffer = tmp;

                    // Обрабатываем буфер: ищем границу и пытаемся извлечь полный блок (заголовки + тело)
                    let boundaryIndex = findSubarray(buffer, boundary);
                    // Пока в буфере обнаруживается граница
                    while (boundaryIndex !== -1) {
                        // После границы ожидаем заголовки – от boundary до двойного CRLF
                        const headerStart = boundaryIndex + boundary.length;
                        const headerEnd = findSubarray(buffer, doubleCRLF, headerStart);
                        if (headerEnd === -1) break; // Заголовок не полный — ждем следующего фрагмента

                        // Получаем строку заголовков
                        const headersStr = decoder.decode(buffer.slice(headerStart, headerEnd));
                        // Здесь можно извлечь нужные параметры; в примере берется Content-ID, если он есть
                        let id = 0;
                        const headerLines = headersStr.split("\r\n").filter(Boolean);
                        headerLines.forEach(line => {
                            if (line.startsWith("Content-ID:")) {
                                const parts = line.split(":");
                                if (parts[1]) {
                                    id = parseInt(parts[1].trim(), 10);
                                }
                            }
                        });

                        // Тело изображения начинается после двойного CRLF
                        const bodyStart = headerEnd + doubleCRLF.length;
                        // Ищем следующую границу, которая завершит тело изображения
                        const nextBoundaryIndex = findSubarray(buffer, boundary, bodyStart);
                        if (nextBoundaryIndex === -1) break; // Тело не полностью получено

                        // Иногда в конце тела может остаться лишний CRLF, его можно обрезать
                        const imageData = buffer.slice(bodyStart, nextBoundaryIndex - 2);
                        // Создаем Blob из полученных данных с типом изображения (здесь image/jpeg; если формат иной — изменить)
                        const blob = new Blob([imageData], { type: "image/jpeg" });
                        // Создаем URL, подходящий для использования в src img тега
                        const imageUrl = URL.createObjectURL(blob);
                        // Добавляем полученное изображение в состояние
                        setImages(prev => [...prev, { id, imageUrl }]);
                        // Обрезаем обработанные данные из буфера
                        buffer = buffer.slice(nextBoundaryIndex);
                        boundaryIndex = findSubarray(buffer, boundary);
                    }
                }
            } catch (err: unknown) {
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
