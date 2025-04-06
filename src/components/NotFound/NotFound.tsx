import stylesheet from "./NotFound.module.css";

const NotFound = () => {
    return (
        <main className={stylesheet.notFoundForm}>
            <h2 className={stylesheet.notFoundFormText}>Страница не найдена 404</h2>
        </main>
    )
}

export default NotFound;