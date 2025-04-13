import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';
import { useEffect } from 'react';
import LoginForm from './components/AuthForm/LoginForm.tsx';
import SignUpForm from './components/AuthForm/SignUpForm.tsx';
import Logout from "./components/AuthForm/Logout.tsx";
import NotFound from "./components/NotFound/NotFound.tsx";
import Feed from "./components/Feed/Feed.tsx";
import Header from "./components/Header/Header.tsx";
import AuthorPage from "./components/AuthorPage/AuthorPage.tsx";
import ArticlePage from "./components/ArticlePage/ArticlePage.tsx";
import AddArticle from "./components/ArticleActions/AddArticle.tsx";

const App = () => {
    return (
        <CookiesProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </CookiesProvider>
    );
};

const AppContent = () => {
    const { pathname } = useLocation();
    const hideHeader = pathname === '/auth/login' || pathname === '/auth/sign_up';

    return (
        <>
            {!hideHeader && <Header />}
            <RouteChangeListener />
            <Routes>
                <Route path="/" element={<Navigate to="/auth/login" replace />} />
                <Route path="/auth/login" element={<LoginForm />} />
                <Route path="/auth/sign_up" element={<SignUpForm />} />
                <Route path="/auth/logout" element={<Logout />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/author/:authorName" element={<AuthorPage />} />
                <Route path="/article/:articleId" element={<ArticlePage />} />
                <Route path="/article/add_article" element={<AddArticle />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};

function RouteChangeListener() {
    const { pathname } = useLocation();

    useEffect(() => {
        console.log('Переход на:', pathname);
    }, [pathname]);

    return null;
}

export default App;
