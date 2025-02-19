import { useState, useRef, useEffect } from "react";

function FormUrlCheck() {

    const [formData, setFormData] = useState({
        url: "",
    });
    const [error, setError] = useState('');

    const inputRef = useRef(null);

    useEffect(() => {
        if(inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleInputChange = (e) => {
        setError('');
        const { name, value } = e.target;
        setFormData({
          ...formData,
          [name]: value,
        });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
      
        // Валидация URL
        if (!isValidUrl(formData.url)) {
          setError('Некорректный URL');
          inputRef.current.focus();
          return;
        }
      
        // Нормализация URL
        const normalizedUrl = normalizeUrl(formData.url);
        if (!normalizedUrl) {
          setError('Не удалось нормализовать URL');
          inputRef.current.focus();
          return;
        }
      
        // Очистка ошибок
        setError('');
      
        try {
          // Отправка данных на сервер
          const response = await fetch('https://scam-checker.vercel.app/api/check-url', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: normalizedUrl }),
          });
      
          const result = await response.json();
      
          if (result.safe) {
            console.log('URL is supposedly safe:', normalizedUrl);
          } else {
            console.log('URL probably contains threats:', result.threats);
          }
        } catch (error) {
          console.error('Error sending request:', error);
        }
      
        // Сброс формы
        setFormData({ url: '' });
      
        // Установка фокуса на поле ввода
        inputRef.current.focus();
      };

    return (
        <form
            className="form__box"
            onSubmit={handleFormSubmit}>
            {error && <p className="form-box__error">{error}</p>}
            <input
                className="form-box__input"
                name="url"
                type="text"
                required
                placeholder="https://example.com"
                onChange={handleInputChange}
                ref={inputRef}
            />
            <button className="form-box__button" type="submit">Check</button>
            
        </form>
    )
}

export default FormUrlCheck;

const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

const normalizeUrl = (url) => {
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      const urlObj = new URL(url);
      urlObj.hash = '';
      return urlObj.toString();
    } catch {
        return null;
    }
  };