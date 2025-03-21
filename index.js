// Importar o servidor express
const express = require("express");
// Importar o módulo cors
const cors = require("cors");
// Importar o módulo mysql
const mysql = require("mysql2");
// Importar o módulo helmet
const helmet = require("helmet");
// Importar o módulo morgan
const morgan = require("morgan");
// Importa o módulo bcrypt
const bcrypt = require("bcrypt")

// Carregando os módulos para a execução no Back-end
const app = express();
app.use(express.json());  
app.use(cors());
app.use(helmet());
app.use(morgan("combined"));

// Configurações de conexão com o banco de dados MySQL
const con = mysql.createConnection({
    host: "127.0.0.1",
    port: "3306",
    user: "root",
    password: "",
    database: "dbexpress"
});

// Endpoints para acesso
app.get("/", (req, res) => {
    // Obter os dados dos clientes que estão cadastrados no banco de dados
    con.query("SELECT * FROM clientes", (error, result) => {
        if (error) {
            return res.status(500).send({ msg: `Erro ao tentar selecionar clientes. ${error}` });
        }
        res.status(200).send({ payload: result });
    });
});

app.post("/cadastrar", (req, res) => {
    
    bcrypt.hash(req.body.senha,10,(error,novasenha)=>{
    if(error){
        return res.status(500).send({msg: `Algo deu errado ao tentar cadastrar. Tente novamente`})
        }else{
            // Vamos devolver a senha para o Body
            // Porém a senha está criptografada
            req.body.senha=novasenha;

    
    con.query("INSERT INTO clientes SET ?", req.body, (error, result) => {
        if (error) {
            return res.status(400).send({ msg: `Erro ao tentar cadastrar. ${error}` });
        }
        res.status(201).send({ msg: 'Cliente cadastrado com sucesso!', payload: result });
    });
}
        
})   
});
app.put("/atualizar/:id", (req, res) => {
    // Verifying if the ID is present and valid
    if (req.params.id === "0" || req.params.id == null) {
        return res.status(400).send({ msg: "Necessário o envio do ID para executar essa função" });
    }

    // Run the query to update the 'clientes' table
    con.query("UPDATE clientes SET ? WHERE id = ?", [req.body, req.params.id], (error, result) => {
        if (error) {
            return res.status(500).send({ msg: `Erro ao tentar atualizar: ${error.message}` });
        }
        return res.status(200).send({ msg: "Cliente Atualizado", payload: result });
    });
});

app.delete("/apagar/:id", (req, res) => {
    if (req.params.id === "0" || req.params.id == null) {
        return res.status(400).send({ msg: "ID inválido ou não fornecido" });
    }

    con.query("DELETE FROM clientes WHERE id = ?", [req.params.id], (error, result) => {
        if (error) {
            return res.status(500).send({ msg: `Erro ao tentar apagar: ${error}` });
        }


        return res.status(204).send({ msg: "Cliente apagado com sucesso" });
    });
});

app.post("/login",(req, res)=>{

    con.query("select * from clientes where usuario=?",req.body.usuario,(error,result)=>{
        if(error){
            return res.status(500).send({msg:`Erro ao tentar se conectar`})
        }else if(result[0]==null){
            return res.status(400).send({msg:`Usuário ou senha estão incorretos`})
        }else{
            bcrypt.compare(req.body.senha,result[0].senha)
            .then((igual)=>{
                if(!igual){
                    return res.status(400).send({msg:`Usuário logado`})
                }
            }).catch((error)=>res.status(500).send({msg:`Muitas tentativas, tente novamente mais tarde`}))

        }
    })
})
app.listen(8000, () => console.log("Servidor Online"));
