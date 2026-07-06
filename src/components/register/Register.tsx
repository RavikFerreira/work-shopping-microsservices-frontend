import "./Register.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface RegisterData {
  userName: string;
  email: string;
  password: string;
}

function Register() {

    const navigate = useNavigate();

    const [register, setRegister] = useState<RegisterData>({
        userName: "",
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegister({
        ...register,
        [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            console.log("Enviando:", register);

            const response = await fetch("http://localhost:8087/api/v1/auth/register", {
                method: 'POST',
                credentials: 'include',
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(register),
        });

        console.log("Status:", response.status);

        const text = await response.text();
        console.log("Resposta:", text);

       if (!response.ok) {
        let errorMessage = "Erro ao cadastrar usuário!";
        try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorMessage;
        } catch {
            errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

        alert("Usuário cadastrado com sucesso!");
        navigate("/")

    } catch (error) {
        console.error("Erro:", error);
        alert(error instanceof Error ? error.message : "Erro ao cadastrar usuário!");
    }
  };

  return (
    <div className="register-container">
      <form className="register-card" onSubmit={handleSubmit}>
        <h2>Criar Conta</h2>

        <input
          type="text"
          name="userName"
          placeholder="Nome de usuário"
          value={register.userName}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={register.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Senha"
          value={register.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Cadastrar</button>

        <p className="login-link">
          Já possui uma conta? <Link to="/">Entrar</Link>
        </p>

      </form>
    </div>
  );
}

export default Register;