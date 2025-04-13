import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import TextareaAutosize from 'react-textarea-autosize';
import useUploadArticleImages from "../../hooks/useUploadArticleImages";
import stylesheet from "./ArticleActions.module.css";

const AddArticle = () => {
    const navigate = useNavigate();
    const [cookies] = useCookies(["jwt", "login"]);
    const jwt = cookies.jwt;

    // Состояния для полей формы
    const [title, setTitle] = useState("");
    const [announcement, setAnnouncement] = useState("");
    const [articleBody, setArticleBody] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // Состояние для хранения выбранных изображений (base64)
    const [pendingImages, setPendingImages] = useState<string[]>([]);

    // Инициализируем хук для загрузки изображений (без передачи articleId)
    const { uploadImages, error: uploadError } = useUploadArticleImages();

    // Обработка отправки формы (создание статьи)
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!jwt) {
            setSubmitError("Отсутствует JWT токен. Пожалуйста, выполните вход.");
            navigate("/auth/login");
            return;
        }
        if (!title || !announcement || !articleBody) {
            setSubmitError("Все поля должны быть заполнены.");
            return;
        }
        setSubmitError("");
        setIsSubmitting(true);

        try {
            const response = await fetch(`http://${import.meta.env.VITE_API_URL}/feed/add_article`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${jwt}`
                },
                body: JSON.stringify({ title, announcement, article_body: articleBody })
            });
            if (!response.ok) {
                throw new Error("Ошибка при создании статьи");
            }
            const newArticle = await response.json();
            console.log("newArticle ", newArticle);
            const articleId = newArticle.article_id;

            // Если есть изображения для загрузки, отправляем их с articleId
            if (pendingImages.length > 0) {
                await uploadImages(articleId, pendingImages);
                setPendingImages([]);
            }
            navigate(`/article/${articleId}`);
        } catch (err) {
            if (err instanceof Error) {
                setSubmitError(err.message);
            } else {
                setSubmitError("Произошла неизвестная ошибка при отправке формы.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Обработка выбора файлов – конвертация выбранных изображений в base64
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                // Берем часть строки после запятой
                const base64String = (reader.result as string).split(",")[1];
                setPendingImages(prev => [...prev, base64String]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemovePendingImage = (indexToRemove: number) => {
        setPendingImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    return (
        <main className={stylesheet.articleActionsPage}>
            <h1>Добавить статью</h1>
            {submitError && <p style={{ color: "red" }}>{submitError}</p>}
            <div className={stylesheet.inputArticleContainer}>
                <form onSubmit={handleSubmit} id="articleForm" className={stylesheet.inputArticleDataForm}>
                    <div className={stylesheet.articlePartContainer}>
                        <label htmlFor="title" className={stylesheet.articlePartName}>Заголовок:</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Введите название статьи здесь..."
                            className={stylesheet.articleDataInput}
                        />
                    </div>
                    <div className={`${stylesheet.articlePartContainer} ${stylesheet.articleBodyContainer}`}>
                        <label htmlFor="announcement" className={stylesheet.articlePartName}>Анонс:</label>
                        <TextareaAutosize
                            id="announcement"
                            value={announcement}
                            onChange={e => setAnnouncement(e.target.value)}
                            placeholder="Введите анонс здесь, он будет отображеться в ленте..."
                            className={stylesheet.articleDataTextarea}
                        />
                    </div>
                    <div className={`${stylesheet.articlePartContainer} ${stylesheet.articleBodyContainer}`}>
                        <label htmlFor="articleBody" className={stylesheet.articlePartName}>Содержание статьи:</label>
                        <TextareaAutosize
                            id="articleBody"
                            value={articleBody}
                            onChange={e => setArticleBody(e.target.value)}
                            placeholder="Введите текст статьи здесь..."
                            className={stylesheet.articleDataTextarea}
                        />
                    </div>
                </form>

                <section className={stylesheet.inputArticleImagesContainer}>
                    <h3>Добавить изображения</h3>
                    <label className={stylesheet.selectImageLabel}>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        <span>Выберите файл</span>
                    </label>
                    {pendingImages.length > 0 && (
                        <div className={stylesheet.selectedImagesWrapper}>
                            <p>Выбранные изображения для загрузки:</p>
                            <div className={stylesheet.selectedImages}>
                                {pendingImages.map((img, index) => (
                                    <div key={index} className={stylesheet.imagePreview}>
                                        <img
                                            src={`data:image/jpeg;base64,${img}`}
                                            alt={`Новая загрузка ${index}`}
                                            className={stylesheet.articleImage}
                                        />
                                        <button
                                            onClick={() => handleRemovePendingImage(index)}
                                            className={stylesheet.articleDeleteImage}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {uploadError && <p className="error">{uploadError}</p>}
                        </div>
                    )}
                </section>

                <button type="submit" form="articleForm" disabled={isSubmitting} className={stylesheet.addArticleButton}>
                    {isSubmitting ? "Отправка..." : "Добавить статью"}
                </button>
            </div>
        </main>
    );
};

export default AddArticle;
