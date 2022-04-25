const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

require('dotenv').config()

const articles = [
  {
    id: 1,
    name: "Voiture de course",
    img: "https://th.bing.com/th/id/R.53204699646f4b43a016f219a94ac12b?rik=FQYa8oTD2jL2Ww&pid=ImgRaw&r=0",
    amount: 150
  },
  {
    id: 2,
    name: "Moto télécommandé",
    img: "https://www.motonline.com.br/noticia/wp-content/uploads/2017/05/Twister_especial.png",
    amount: 150
  }
]

//Initialisation de Express JS
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Route de test du bon fonctionnement du serveur web
app.get("/hello/ping", (req, res) => {
  res.send({ message: "Pong"});
});

//Route de récupération des articles
app.get("/articles", (req, res) => {
  res.send(articles);
})

//Route de récupération des articles
app.get("/articles/:id", (req, res) => {
  //Récupération de l'article
  const article = articles.find(a => a.id == req.params.id);
  if(!article){
    res.status(404).send("Article not found !");
    return;
  } else {
    res.send(article);
  }
})

//Route de récupération du lien de paiement
app.get("/paiement/:articleId", async (req, res) => {
  
  //Récupération de l'article
  const article = articles.find(a => a.id == req.params.articleId);
  if(!article){
    res.status(404).send("Article not found !");
    return;
  }
  
  //Création d'une référence pour le paiement
  const reference = "JOY" + Date.now() + "-"  + req.params.articleId;
  
  //Récupération des informations SingPay.

  //Pour des raisons de sécurité ces informations doivent être stocker hors du 
  // code source de l'application, dans des variables d'environnement par exemple.
  const baseURL = process.env.SP_BASE_URL;
  const clientId = process.env.SP_CLIENT_ID;
  const clientSecret = process.env.SP_CLIENT_SECRET;
  const walletId = process.env.SP_WALLET_ID;
  
  const response = await fetch(`${baseURL}/ext`, {
    method: "post",
    headers: {
      "content-type": "application/json",
      "x-client-id": clientId,
      "x-client-secret": clientSecret,
      "x-wallet": walletId
    },
    body: JSON.stringify({
      reference,
      amount: article.amount,
      portefeuille: walletId,
      redirect_success: "http://localhost:5500/paiement_result_success.html?id=" + req.params.articleId,
      redirect_error: "http://localhost:5500/paiement_result_error.html?id=" + req.params.articleId,
    })
  });
  
  if(response.status == 200){
    const result = await response.json();
    res.send({
      success: true,
      result
    });
  } else {
    const result = await response.text();
    res.send({
      success: false,
      result
    })
  }
  
});

//URL de callback SingPay
 
//ATTENTION: Cette API doit être accessible via une adresse IP publique !
app.post("/paiement/callback", (req, res) => {
  //Toute les informations de la requête se trouve dans l'objet "req.transaction"
  const reference = req.transaction.reference;
  if(reference){
    //Récupération de l'article concerné
    const articleId = reference.split("-")[1];
    const article = articles.find(a => a.id = articleId);
    if(article){
      //Mettre à jour le stock
      //Envoyer des notifications
      //etc
    }
  }
  res.sendStatus(200);
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log("(Boutique jouets) Listenning at " + port));