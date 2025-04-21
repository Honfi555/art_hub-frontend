import { FC, useState, useEffect, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import TextareaAutosize from "react-textarea-autosize";

import useArticleData from "../../hooks/useArticleData.ts";
import useFetchArticleImages from "../../hooks/useFetchArticleImages.ts";
import useRemoveArticleImages from "../../hooks/useRemoveArticleImages.ts";
import useUploadArticleImages from "../../hooks/useUploadArticleImages.ts";

import stylesheet from "./ArticleActions.module.css";

interface Image {
    id: string;
    imageUrl: string;
}

const UpdateArticle: FC = () => {
    const { articleId } = useParams();
    const navigate = useNavigate();
    const [cookies] = useCookies(["jwt"]);
    const jwt = cookies.jwt;

    // 1) Данные статьи
    const {
        article,
        loading: loadingArticle,
        error: errorArticle,
    } = useArticleData(articleId);

    // 2) Состояния формы
    const [title, setTitle] = useState("");
    const [announcement, setAnnouncement] = useState("");
    const [articleBody, setArticleBody] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 3) Инициализация формы при получении article
    useEffect(() => {
        if (article) {
            setTitle(article.title);
            setAnnouncement(article.announcement);
            setArticleBody(article.articleBody);
        }
    }, [article]);

    // 4) Работа с существующими картинками
    const {
        images: fetchedImages,
        loading: loadingFetchImages,
        error: errorFetchImages,
    } = useFetchArticleImages(articleId!, false);
    const [displayedImages, setDisplayedImages] = useState<Image[]>([]);
    useEffect(() => {
        setDisplayedImages(fetchedImages);
    }, [fetchedImages]);

    const {
        removeImages,
        loading: loadingRemove,
        error: errorRemove,
    } = useRemoveArticleImages();

    const handleRemoveExisting = async (imgId: string) => {
        console.log(`articleId ${articleId}; imgId ${imgId}`);
        try {
            await removeImages(articleId!, [imgId]);
            setDisplayedImages((prev) => prev.filter((img) => img.id !== imgId));
        } catch {
            /* Ошибка попадёт в errorRemove */
        }
    };

    // 5) Подготовка новых картинок для загрузки
    const [pendingImages, setPendingImages] = useState<string[]>([]);
    const { uploadImages, error: errorUpload } =
        useUploadArticleImages();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = (reader.result as string).split(",")[1];
                setPendingImages((prev) => [...prev, base64]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemovePending = (idx: number) => {
        setPendingImages((prev) => prev.filter((_, i) => i !== idx));
    };

    // 6) Сабмит — обновляем статью, удаляем и/или добавляем картинки
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!jwt) {
            setFormError("Выполните вход, чтобы иметь возможность редактировать статью.");
            navigate("/auth/login");
            return;
        }
        if (!title || !announcement || !articleBody) {
            setFormError("Все поля обязательны для заполнения.");
            return;
        }
        setFormError(null);
        setIsSubmitting(true);

        try {
            // Собираем payload согласно ArticleFull
            const payload = {
                id: Number(articleId),
                title,
                user_name: article?.userName || "",
                announcement,
                article_body: articleBody,
            };

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/feed/update_article`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!res.ok) {
                throw new Error(`Не удалось обновить статью (${res.status})`);
            }

            // загрузка новых картинок (если есть)
            if (pendingImages.length > 0) {
                await uploadImages(articleId!, pendingImages);
                setPendingImages([]);
            }

            navigate(`/article/${articleId}`);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Неизвестная ошибка");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 7) Рендер
    if (loadingArticle) return <p>Загрузка данных статьи…</p>;
    if (errorArticle) return <p style={{ color: "red" }}>{errorArticle}</p>;

    return (
        <main className={stylesheet.articleActionsPage}>
            <h1>Редактировать статью</h1>
            {formError && <p style={{ color: "red" }}>{formError}</p>}
            <div className={stylesheet.inputArticleContainer}>
            <form
                onSubmit={handleSubmit}
                id="updateArticleForm"
                className={stylesheet.inputArticleDataForm}
            >
                <div className={stylesheet.articlePartContainer}>
                    <label htmlFor="title" className={stylesheet.articlePartName}>
                        Заголовок:
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={stylesheet.articleDataInput}
                    />
                </div>

                <div
                    className={`${stylesheet.articlePartContainer} ${stylesheet.articleBodyContainer}`}
                >
                    <label htmlFor="announcement" className={stylesheet.articlePartName}>
                        Анонс:
                    </label>
                    <TextareaAutosize
                        id="announcement"
                        value={announcement}
                        onChange={(e) => setAnnouncement(e.target.value)}
                        className={stylesheet.articleDataTextarea}
                    />
                </div>

                <div
                    className={`${stylesheet.articlePartContainer} ${stylesheet.articleBodyContainer}`}
                >
                    <label htmlFor="articleBody" className={stylesheet.articlePartName}>
                        Содержание:
                    </label>
                    <TextareaAutosize
                        id="articleBody"
                        value={articleBody}
                        onChange={(e) => setArticleBody(e.target.value)}
                        className={stylesheet.articleDataTextarea}
                    />
                </div>
            </form>

            {/* Секция работы с картинками */}
            <section className={stylesheet.inputArticleImagesContainer}>
                <h3>Текущие изображения</h3>
                {loadingFetchImages || loadingRemove ? (
                    <p>Обработка изображений…</p>
                ) : errorFetchImages || errorRemove ? (
                    <p style={{ color: "red" }}>{errorFetchImages || errorRemove}</p>
                ) : (
                    <div className={stylesheet.selectedImages}>
                        {displayedImages.map((img) => (
                            <div key={img.id} className={stylesheet.imagePreview}>
                                <img
                                    src={img.imageUrl}
                                    alt=""
                                    className={stylesheet.articleImage}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveExisting(img.id)}
                                    className={stylesheet.articleDeleteImage}
                                >
                                    Удалить
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <h3>Добавить новые изображения</h3>
                <label className={stylesheet.selectImageLabel}>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                    <span>Выберите файлы</span>
                </label>
                {pendingImages.length > 0 && (
                    <div className={stylesheet.selectedImagesWrapper}>
                        {pendingImages.map((b64, i) => (
                            <div key={i} className={stylesheet.imagePreview}>
                                <img
                                    src={`data:image/jpeg;base64,${b64}`}
                                    alt=""
                                    className={stylesheet.articleImage}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemovePending(i)}
                                    className={stylesheet.articleDeleteImage}
                                >
                                    Удалить
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {errorUpload && <p style={{ color: "red" }}>{errorUpload}</p>}
            </section>

            <button
                type="submit"
                form="updateArticleForm"
                disabled={isSubmitting}
                className={stylesheet.addArticleButton}
            >
                {isSubmitting ? "Сохраняем…" : "Сохранить изменения"}
            </button>
            </div>
        </main>
    );
};

export default UpdateArticle;
