// Хук-обертка для удобного доступа
import {useContext} from "react";
import AuthorContext from "./AuthorContext.tsx";

export const useAuthor = () => useContext(AuthorContext);