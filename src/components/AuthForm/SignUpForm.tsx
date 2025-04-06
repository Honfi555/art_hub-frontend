import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import stylesheet from "./Auth.module.css";

const SignUpForm = () => {
    const navigate = useNavigate();
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [, setCookie] = useCookies(['jwt', 'login']);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:8000/auth/sign_up', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ login, password })
            });

            if (!response.ok) {
                setError('Ошибка входа');
                return;
            }

            const data = await response.json();
            const token = data.token;
            setCookie('jwt', token, { path: '/' });
            setCookie('login', login, { path: '/' });

            console.log('Вход выполнен успешно');

            navigate('/feed');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Произошла неизвестная ошибка');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={stylesheet.authForm}>
            <div className={stylesheet.authFormHeader}>
                <h1>Регистрация в ArtHub</h1>
            </div>
            <div className={stylesheet.authFormBody}>
                <form onSubmit={handleSubmit}>
                    <div className={stylesheet.authFormText}>
                        <label htmlFor="login_field">Логин или адрес почты</label>
                    </div>
                    <input
                        type="text"
                        name="login"
                        id="login_field"
                        className={stylesheet.authFormCredentialsInput}
                        autoCapitalize="off"
                        autoFocus
                        required
                        value={login}
                        onChange={(e) => setLogin(e.target.value)}
                    />
                    <div className={stylesheet.authFormText}>
                        <label htmlFor="password">Пароль</label>
                        {/*<a href="/auth/password_reset">Забыли пароль?</a>*/}
                    </div>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        className={stylesheet.authFormCredentialsInput}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        type="submit"
                        className={stylesheet.authSubmitInput}
                        value={loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    />
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </form>
            </div>
            <div className={stylesheet.authFormFooter}>
                <p>
                    Есть аккаунт? <a href="/auth/login" className={'nowrap'}>Войти в аккаунт</a>
                </p>
            </div>
        </main>
    );
};

export default SignUpForm;
