import './FinalizarCompra.css';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ItemCarrinho {
  idProduct: number;
  name: string;
  price: number;
  quantidadeSelecionada: number;
}

const FORMAS_PAGAMENTO = [
  { value: "PIX", label: "Pix" },
  { value: "DINHEIRO", label: "Dinheiro" },
];

function FinalizarCompra() {
  const navigate = useNavigate();
  const [carrinho] = useState<ItemCarrinho[]>(
    JSON.parse(localStorage.getItem("carrinho") || "[]")
  );
  const [formaPagamento, setFormaPagamento] = useState("");
  const [enviando, setEnviando] = useState(false);

  const totalPreco = carrinho.reduce(
    (acc, item) => acc + item.price * item.quantidadeSelecionada,
    0
  );

  const handleConfirmar = async () => {
    if (!formaPagamento) {
      alert("Selecione uma forma de pagamento.");
      return;
    }

    const token = localStorage.getItem("token");
    const idShopping = localStorage.getItem("idShopping");

    if (!idShopping) {
      alert("Não foi possível identificar seu pedido. Tente novamente.");
      return;
    }

    setEnviando(true);

    try {
      const pagamentoResponse = await fetch(
        `http://localhost:8083/payment/${idShopping}`,
        {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!pagamentoResponse.ok) {
        const text = await pagamentoResponse.text();
        throw new Error(text || "Erro ao processar pagamento");
      }

      const finalizarResponse = await fetch(
        `http://localhost:8083/finallyOrder/${idShopping}`,
        {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!finalizarResponse.ok) {
        const text = await finalizarResponse.text();
        throw new Error(text || "Erro ao finalizar pedido");
      }

      alert("Pedido realizado com sucesso!");
      localStorage.removeItem("carrinho");
      localStorage.removeItem("idShopping");
      navigate("/inicio");
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Erro ao finalizar compra");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2>Finalizar Compra</h2>

      <div className="checkout-resumo">
        <h3>Resumo do Pedido</h3>
        {carrinho.length === 0 ? (
          <p>Seu carrinho está vazio.</p>
        ) : (
          <>
            {carrinho.map((item) => (
              <div className="checkout-item" key={item.idProduct}>
                <span>{item.name} x{item.quantidadeSelecionada}</span>
                <span>R$ {(item.price * item.quantidadeSelecionada).toFixed(2)}</span>
              </div>
            ))}
            <div className="checkout-total">
              <strong>Total: R$ {totalPreco.toFixed(2)}</strong>
            </div>
          </>
        )}
      </div>

      <div className="checkout-pagamento">
        <h3>Forma de Pagamento</h3>
        {FORMAS_PAGAMENTO.map((forma) => (
          <label key={forma.value} className="pagamento-option">
            <input
              type="radio"
              name="pagamento"
              value={forma.value}
              checked={formaPagamento === forma.value}
              onChange={(e) => setFormaPagamento(e.target.value)}
            />
            {forma.label}
          </label>
        ))}
      </div>

      <button
        className="btn-confirmar"
        onClick={handleConfirmar}
        disabled={carrinho.length === 0 || enviando}
      >
        {enviando ? "Processando..." : "Confirmar Pedido"}
      </button>
    </div>
  );
}

export default FinalizarCompra;