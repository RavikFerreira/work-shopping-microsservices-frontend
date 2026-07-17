import './Menu.css';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

interface Produto {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface ItemCarrinho extends Produto {
  quantidadeSelecionada: number;
}

function Menu() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8083/product/list")
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch((err) => console.error(err));
  }, []);

  const handleAddToCart = (produto: Produto) => {
    setCarrinho((prev) => {
      const existente = prev.find((item) => item.id === produto.id);
      if (existente) {
        return prev.map((item) =>
          item.id === produto.id
            ? { ...item, quantidadeSelecionada: item.quantidadeSelecionada + 1 }
            : item
        );
      }
      return [...prev, { ...produto, quantidadeSelecionada: 1 }];
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleRemoveFromCart = (id: number) => {
    setCarrinho((prev) => prev.filter((item) => item.id !== id));
  };

  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidadeSelecionada, 0);
  const totalPreco = carrinho.reduce(
    (acc, item) => acc + item.price * item.quantidadeSelecionada,
    0
  );

  const handleCheckout = () => {
  const token = localStorage.getItem("token");
  if (token) {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    navigate("/compra");
  } else {
    navigate("/");
  }
};

  return (
    <>
      <nav className="navbar">
        <h1>🛍️ CONNECTADOS</h1>
        <div className="navbar-actions">
          <button
            className="btn-cart"
            onClick={() => setCarrinhoAberto(!carrinhoAberto)}
          >
            🛒 Carrinho
            {totalItens > 0 && <span className="cart-badge">{totalItens}</span>}
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </nav>

      {carrinhoAberto && (
        <div className="cart-overlay" onClick={() => setCarrinhoAberto(false)}>
          <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Seu Carrinho</h2>
              <button className="cart-close" onClick={() => setCarrinhoAberto(false)}>
                ✕
              </button>
            </div>

            {carrinho.length === 0 ? (
              <p className="cart-empty">Seu carrinho está vazio.</p>
            ) : (
              <>
                <div className="cart-items">
                  {carrinho.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <div>
                        <h4>{item.name}</h4>
                        <span className="cart-item-qtd">
                          {item.quantidadeSelecionada} x R$ {item.price.toFixed(2)}
                        </span>
                      </div>
                      <button
                        className="cart-remove"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <span className="cart-total">Total: R$ {totalPreco.toFixed(2)}</span>
                  <button className="btn-checkout" onClick={handleCheckout}>
                    Finalizar Compra
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="menu">
        <div className="itens-grid">
          {produtos.map((produto) => (
            <div className="item-card" key={produto.id}>
              <div className="item-info">
                <h3>{produto.name}</h3>
                <span className="item-estoque">
                  {produto.quantity > 0
                    ? `${produto.quantity} em estoque`
                    : "Fora de estoque"}
                </span>
              </div>
              <div className="item-footer">
                <span className="item-preco">R$ {produto.price.toFixed(2)}</span>
                <button
                  className="btn-add"
                  disabled={produto.quantity === 0}
                  onClick={() => handleAddToCart(produto)}
                >
                  Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Menu;