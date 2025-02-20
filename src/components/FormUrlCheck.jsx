import { useState, useRef, useEffect } from "react";

function FormUrlCheck() {
  const [formData, setFormData] = useState({ url: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const inputRef = useRef(null);

  // Определяем базовый URL API в зависимости от окружения:
  // Если локальный хост, используем локальный сервер, иначе адрес продакшена.
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:3000/api/check-url"
      : "https://scam-checker.vercel.app/api/check-url";

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e) => {
    setError("");
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
      setError("Некорректный URL");
      inputRef.current.focus();
      return;
    }

    // Нормализация URL
    const normalizedUrl = normalizeUrl(formData.url);
    if (!normalizedUrl) {
      setError("Не удалось нормализовать URL");
      inputRef.current.focus();
      return;
    }

    // Сброс ошибок и установка состояния загрузки
    setError("");
    setLoading(true);
    setResult(null);

    try {
      // Пытаемся отправить POST-запрос
      let response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });

      // Если получили 404, пробуем GET-запрос
      if (response.status === 404) {
        console.warn("POST-запрос вернул 404, пробую GET-запрос");
        response = await fetch(
          `${API_URL}?url=${encodeURIComponent(normalizedUrl)}`,
          { method: "GET" }
        );
      }

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const resultData = await response.json();

      if (resultData.safe) {
        setResult({
          safe: true,
          message: `URL безопасен: ${normalizedUrl}`,
        });
      } else {
        setResult({
          safe: false,
          message: `URL может быть опасен`,
          threats: resultData.threats,
        });
      }
    } catch (error) {
      console.error("Error sending request:", error);
      setError("Ошибка при проверке URL");
    } finally {
      setLoading(false);
      // Сброс формы
      setFormData({ url: "" });
      inputRef.current.focus();
    }
  };

  return (
    <form className="form__box" onSubmit={handleFormSubmit}>
      {error && <p className="form-box__error">{error}</p>}
      <input
        className="form-box__input"
        name="url"
        type="text"
        required
        placeholder="https://example.com"
        onChange={handleInputChange}
        ref={inputRef}
        value={formData.url}
      />
      <button className="form-box__button" type="submit" disabled={loading}>
        {loading ? "Проверяется..." : "Check"}
      </button>
      {result && (
        <div className="result">
          <p>{result.message}</p>
          {result.threats && (
            <pre>{JSON.stringify(result.threats, null, 2)}</pre>
          )}
        </div>
      )}
    </form>
  );
}

export default FormUrlCheck;

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const normalizeUrl = (url) => {
  try {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    const urlObj = new URL(url);
    urlObj.hash = "";
    return urlObj.toString();
  } catch {
    return null;
  }
};
