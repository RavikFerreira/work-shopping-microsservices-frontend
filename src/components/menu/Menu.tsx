import './Menu.css';
import { useEffect, useState } from "react";

interface Produto {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  category: string;
}

function Menu() {
  const [produtos, setProdutos] = useState<Produto[]>([]);

  useEffect(() => {
    fetch("http://localhost:8083/product/list")
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch((err) => console.error(err));
  }, []);

  const produtosPorCategoria = produtos.reduce((acc, produto) => {
    const categoria = produto.category;

    if (!acc[categoria]) {
      acc[categoria] = [];
    }

    acc[categoria].push(produto);
    return acc;
  }, {} as Record<string, Produto[]>);

  const handleAddToCart = (produto: Produto) => {
    console.log("Adicionado ao carrinho:", produto);
  };

  return (
    <>
      <nav className="navbar">
        <h1>🛍️ Minha Loja</h1>
      </nav>

      <div className="menu">
        {Object.entries(produtosPorCategoria).map(([categoria, itens]) => (
          <section key={categoria} className="categoria-section">
            <h2 className="categoria-titulo">{categoria}</h2>
            <div className="itens-grid">
              {itens.map((produto) => (
                <div className="item-card" key={produto.id}>
                  <div className="item-info">
                    <h3>{produto.name}</h3>
                    <p className="item-desc">{produto.description}</p>
                    <span className="item-estoque">
                      {produto.quantity > 0
                        ? `${produto.quantity} em estoque`
                        : "Fora de estoque"}
                    </span>
                  </div>
                  <div className="item-footer">
                    <span className="item-preco">
                      R$ {produto.price.toFixed(2)}
                    </span>
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
          </section>
        ))}
      </div>
    </>
  );
}

export default Menu;