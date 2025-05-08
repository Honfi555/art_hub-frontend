import {BrowserRouter, Routes, Route, Navigate, useLocation, useMatch} from 'react-router-dom';
import {CookiesProvider} from 'react-cookie';
import {useEffect} from 'react';
import LoginForm from './components/AuthForm/LoginForm.tsx';
import SignUpForm from './components/AuthForm/SignUpForm.tsx';
import Logout from "./components/AuthForm/Logout.tsx";
import NotFound from "./components/NotFound/NotFound.tsx";
import Header from "./components/Header/Header.tsx";
import AuthorPage from "./components/AuthorPage/AuthorPage.tsx";
import ArticlePage from "./components/ArticlePage/ArticlePage.tsx";
import AddArticle from "./components/ArticleActions/AddArticle.tsx";
import UpdateArticle from "./components/ArticleActions/UpdateArticle.tsx";
import AuthorContext from './contexts/AuthorContext.tsx';
import FeedContainer from "./components/Feed/FeedContainer.tsx";
import SearchContainer from "./components/Feed/SearchContainer.tsx";

const App = () => {
    return (
        <CookiesProvider>
            <BrowserRouter>
                <AppContent/>
            </BrowserRouter>
        </CookiesProvider>
    );
};

const AppContent = () => {
    const {pathname} = useLocation();
    const hideHeader = pathname === '/auth/login' || pathname === '/auth/sign_up';

    // Пытаемся заматчить URL вида /author/:authorName
    const match = useMatch("/author/:authorName");
    const authorName = match?.params.authorName;

    return (
        <AuthorContext.Provider value={{authorName}}>
            {!hideHeader && <Header/>}
            <RouteChangeListener/>
            <Routes>
                <Route path="/" element={<Navigate to="/auth/login" replace/>}/>
                <Route path="/auth/login" element={<LoginForm/>}/>
                <Route path="/auth/sign_up" element={<SignUpForm/>}/>
                <Route path="/auth/logout" element={<Logout/>}/>
                <Route path="/feed" element={<FeedContainer/>}/>
                <Route path="/feed/author/:authorName" element={<AuthorPage/>}/>
                <Route path="/article/:articleId" element={<ArticlePage/>}/>
                <Route path="/article/add_article" element={<AddArticle/>}/>
                <Route path="/article/update_article/:articleId" element={<UpdateArticle/>}/>
                <Route path="/feed/search_result/:query" element={<SearchContainer/>}/>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </AuthorContext.Provider>
    );
};

function RouteChangeListener() {
    const {pathname} = useLocation();

    useEffect(() => {
        console.log('Переход на:', pathname);
    }, [pathname]);

    return null;
}

export default App;
