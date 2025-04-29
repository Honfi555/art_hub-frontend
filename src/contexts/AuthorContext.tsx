import {createContext} from 'react';

// Описываем форму данных в контексте
interface AuthorContextType {
    authorName?: string;
}

// По умолчанию — пустой объект
const AuthorContext = createContext<AuthorContextType>({});

export default AuthorContext;
