import React, { useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import '../Styles/LandingPage.css';

const LandingPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Регистрация
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!login.trim() || login.length < 3) {
      setError('Логин должен содержать минимум 3 символа');
      return;
    }
    if (!validateEmail(email)) {
      setError('Введите корректный email');
      return;
    }
    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5043/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        let errorMsg = data.message || 'Ошибка регистрации';
        if (data.errors) {
          if (data.errors.login) errorMsg = data.errors.login;
          if (data.errors.email) errorMsg = data.errors.email;
        }
        throw new Error(errorMsg);
      }

      setSuccess('Регистрация успешна! Теперь вы можете войти.');
      if (data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = '/player';
      } else {
        setTimeout(() => {
          setIsLoginMode(true);
          setLogin('');
          setPassword('');
          setEmail('');
          setConfirmPassword('');
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Вход (обычный и администратор)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!login.trim()) {
      setError('Введите логин или email');
      return;
    }
    if (!password.trim()) {
      setError('Введите пароль');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5043/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Identifier: login, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Ошибка входа');
      }

      setSuccess('Вход выполнен! Перенаправление...');
      localStorage.setItem('token', data.token);

      const token = data.token;
      localStorage.setItem('token', token);

      const decoded = jwtDecode(token);

      if (decoded.role === 'ADM') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/player';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchToLogin = () => {
    setIsLoginMode(true);
    setError('');
    setSuccess('');
    setLogin('');
    setPassword('');
    setEmail('');
    setConfirmPassword('');
  };

  const switchToRegister = () => {
    setIsLoginMode(false);
    setError('');
    setSuccess('');
    setLogin('');
    setPassword('');
    setEmail('');
    setConfirmPassword('');
  };

  return (
    <div className="landing">
      <div className="container">
        <div className="brand-section">
          <h1 className="logo">KringeMusic</h1>
          <p className="tagline">Музыкальная платформа нового поколения</p>
          <ul className="features">
            <li>🎧 Миллионы треков без рекламы</li>
            <li>📱 Слушай офлайн в любом месте</li>
            <li>🎨 Персональные плейлисты на основе ИИ</li>
            <li>🔊 Звук высокого разрешения</li>
          </ul>
          <div className="stats">
            <span>🔥 10M+ треков</span>
            <span>👥 5M+ слушателей</span>
          </div>
        </div>

        <div className="form-section">
          <div className="form-card">
            <h2>{isLoginMode ? 'Вход в аккаунт' : 'Добро пожаловать'}</h2>
            <p>{isLoginMode ? 'Введите логин и пароль' : 'Зарегистрируйтесь, чтобы начать слушать'}</p>

            <form onSubmit={isLoginMode ? handleLogin : handleRegister}>
              <div className="input-group">
                <label>👤 Логин</label>
                <input
                  type="text"
                  placeholder={isLoginMode ? "username или email" : "username"}
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                />
              </div>

              {!isLoginMode && (
                <>
                  <div className="input-group">
                    <label>📧 Электронная почта</label>
                    <input
                      type="email"
                      placeholder="example@mail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}

              <div className="input-group">
                <label>🔒 Пароль</label>
                <input
                  type="password"
                  placeholder={isLoginMode ? 'Введите пароль' : 'Минимум 6 символов'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {!isLoginMode && (
                <div className="input-group">
                  <label>🔒 Подтвердите пароль</label>
                  <input
                    type="password"
                    placeholder="Повторите пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" disabled={loading}>
                {loading ? (isLoginMode ? 'Вход...' : 'Регистрация...') : (isLoginMode ? 'Войти' : 'Зарегистрироваться')}
              </button>

              <div className="login-link">
                {isLoginMode ? (
                  <>Нет аккаунта? <a href="#" onClick={(e) => { e.preventDefault(); switchToRegister(); }}>Создать аккаунт</a></>
                ) : (
                  <>Уже есть аккаунт? <a href="#" onClick={(e) => { e.preventDefault(); switchToLogin(); }}>Войти</a></>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;