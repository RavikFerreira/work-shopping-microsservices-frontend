import './MenuAdm.css';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

interface Produto {
  idProduct: number;
  name: string;
  price: number;
  quantity: number;
}

interface ProdutoForm {
  idProduct: string;
  name: string;
  price: string;
  quantity: string;
}

const formVazio: ProdutoForm = { idProduct: "", name: "", price: "", quantity: "" };

function MenuAdm() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState<ProdutoForm>(formVazio);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const carregarProdutos = () => {
    setCarregando(true);
    fetch("http://localhost:8083/product/list")
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch((err) => console.error(err))
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const abrirModalNovo = () => {
    setForm(formVazio);
    setEditandoId(null);
    setModalAberto(true);
  };

  const abrirModalEdicao = (produto: Produto) => {
    setForm({
      idProduct: String(produto.idProduct),
      name: produto.name,
      price: String(produto.price),
      quantity: String(produto.quantity),
    });
    setEditandoId(produto.idProduct);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setForm(formVazio);
    setEditandoId(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const token = localStorage.getItem("token");

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      idProduct:  form.idProduct,
      name: form.name,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity, 10),
    };

    const url = editandoId
      ? `http://localhost:8083/product/update/${editandoId}`
      : "http://localhost:8083/product/addProduct";
    const method = editandoId ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Erro ao salvar produto");
      }

      fecharModal();
      carregarProdutos();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Erro ao salvar produto");
    }
  };

  const handleDeletar = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      const response = await fetch(`http://localhost:8083/product/delete/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao excluir produto");
      }

      setProdutos((prev) => prev.filter((p) => p.idProduct !== id));
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Erro ao excluir produto");
    }
  };

  const produtosFiltrados = produtos.filter((p) =>
    p.name.toLowerCase().includes(busca.toLowerCase())
  );

  return (
     <>
      <nav className="navbar">
        <h1>⚙️ Painel Administrativo</h1>
        <div className="navbar-actions">
          <button className="btn-logout" onClick={handleLogout}>
            Sair
          </button>
        </div>
      </nav>

      <div className="adm-container">
        <div className="adm-toolbar">
          <input
            type="text"
            className="input-busca"
            placeholder="Pesquisar produto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button className="btn-novo" onClick={abrirModalNovo}>
            + Novo Produto
          </button>
        </div>

        {carregando ? (
          <p className="adm-loading">Carregando produtos...</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="adm-empty">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                produtosFiltrados.map((produto) => (
                  <tr key={produto.idProduct}>
                    <td>{produto.idProduct}</td>
                    <td>{produto.name}</td>
                    <td>R$ {produto.price.toFixed(2)}</td>
                    <td>{produto.quantity}</td>
                    <td className="adm-acoes">
                      <button
                        className="btn-editar"
                        onClick={() => abrirModalEdicao(produto)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-excluir"
                        onClick={() => handleDeletar(produto.idProduct)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editandoId ? "Editar Produto" : "Novo Produto"}</h2>
            <form onSubmit={handleSalvar}>
              <label>ID</label>
              <input
                type="number"
                name="idProduct"
                min="0"
                value={form.idProduct}
                onChange={handleFormChange}
                required
              />
              <label>Nome</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                required
              />

              <label>Preço</label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleFormChange}
                required
              />

              <label>Estoque</label>
              <input
                type="number"
                name="quantity"
                min="0"
                value={form.quantity}
                onChange={handleFormChange}
                required
              />

              <div className="modal-footer">
                <button type="button" className="btn-cancelar" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar">
                  {editandoId ? "Salvar Alterações" : "Cadastrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default MenuAdm;