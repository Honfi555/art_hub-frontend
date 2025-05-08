import {useState, useEffect, useRef, ChangeEvent, KeyboardEvent} from "react";
import {Link, useNavigate} from "react-router-dom";
import useSearchArticles, {ArticleSearchResult} from "../../hooks/useSearchArticles";
import stylesheet from "./Header.module.css";
import {useAuthor} from "../../contexts/UseAuthor.tsx";
import SearchInputLoading from "./SearchInputLoading.tsx";

const DEBOUNCE_DELAY = 500; // мс

const SearchInput = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const [showDropdown, setShowDropdown] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const {authorName} = useAuthor();

    // Дебаунсим query → debouncedQuery
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, DEBOUNCE_DELAY);

        return () => clearTimeout(timer);
    }, [query]);

    // Срочно «форсим» обновление при Enter или blur
    const flushQuery = () => setDebouncedQuery(query);

    // Поиск статей по debouncedQuery
    const {results, loading, error} = useSearchArticles({
        query: debouncedQuery,
        login: authorName
    });

    // Закрываем дропдаун по клику вне
    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("click", onClickOutside);
        return () => document.removeEventListener("click", onClickOutside);
    }, []);

    const onChange = (e: ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setShowDropdown(true);
    };

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            navigate(`/feed/search_result/${query}`);
        }
    };

    return (
        <div className={stylesheet.searchContainer} ref={containerRef}>
            <input
                className={stylesheet.searchInput}
                type="text"
                placeholder="Поиск статей..."
                value={query}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onBlur={flushQuery}
                onFocus={() => setShowDropdown(true)}
            />

            {showDropdown && (loading || error || results.length > 0) && (
                <ul className={stylesheet.searchDropdown}>
                    {loading && <li className={stylesheet.searchItem}><SearchInputLoading loading={loading} /></li>}
                    {error && <li className={stylesheet.searchItem}>Ошибка</li>}
                    {!loading && !error && results.length === 0 && debouncedQuery && (
                        <li className={stylesheet.searchItem}>Ничего не найдено</li>
                    )}
                    {!loading && results.map((art: ArticleSearchResult) => (
                        <li key={art.article_id} className={stylesheet.searchItem}>
                            <Link
                                to={`/article/${art.article_id}`}
                                className={stylesheet.searchLink}
                                onClick={() => setShowDropdown(false)}
                            >
                                <strong>{art.title}</strong>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchInput;
