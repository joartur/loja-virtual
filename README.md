<p align="center">
  <img src="https://github.com/joartur/loja-virtual/blob/main/public/img/exemplo.png" width="80%" alt="Exemplo">
</p>

---

````markdown
# 🛒 Loja Virtual

Projeto de **Loja Virtual** inspirado no modelo das Lojas Americanas. O sistema possui três áreas principais:

- Visitante (visualização de produtos)
- Cliente (cadastro, login, carrinho e pedidos)
- Administrador (gestão de produtos, categorias e pedidos)

## 🚀 Tecnologias Utilizadas

- **Node.js** — Ambiente de execução JavaScript
- **Sequelize** — ORM para Node.js
- **Handlebars** — Template engine para views dinâmicas
- **MySQL** — Banco de dados relacional

## 🧰 Dependências

Antes de rodar o projeto, certifique-se de ter os seguintes softwares instalados:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [XAMPP](https://www.apachefriends.org/)
- [MySQL Workbench](https://www.mysql.com/products/workbench/)

## ⚙️ Instalação

Siga os passos abaixo para configurar o ambiente de desenvolvimento:

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/loja-virtual.git
   cd loja-virtual
````

2. **Instale as dependências do Node.js**

   ```bash
   npm install
   ```

3. **Configure o banco de dados MySQL**

   * Inicie o MySQL pelo XAMPP.
   * Crie um banco de dados, por exemplo: `loja_virtual`.
   * Configure o arquivo `.env` com as credenciais do banco:

     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=sua_senha
     DB_NAME=loja_virtual
     ```

4. **Execute as migrações do Sequelize**

   ```bash
   npx sequelize db:migrate
   ```

5. **Inicie o servidor**

   ```bash
   npm start
   ```

6. Acesse o projeto em `http://localhost:3000`

## 📂 Estrutura do Projeto

```
loja-virtual/
├── controllers/
├── db/
├── models/
├── helpers/
├── sessions/
├── views/
├── routes/
├── public/
├── .env
├── app.js
└── README.md
.createAdmin.js
.index.js
```

## 🔐 Áreas do Sistema

* **Visitante**

  * Visualização de produtos e categorias

* **Cliente**

  * Cadastro e login
  * Carrinho de compras
  * Histórico de pedidos

* **Administrador**

  * Cadastro e edição de produtos
  * Gestão de categorias
  * Visualização de pedidos

## 📌 Contribuição

Pull requests são bem-vindos. Para mudanças significativas, por favor, abra uma issue primeiro para discutir o que você gostaria de modificar.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT.
<P>
  <img src="https://github.com/joartur/loja-virtual/blob/main/public/img/exemplo-mobile.png" width="20%" alt="Exemplo mobile">
</P>

---

```


