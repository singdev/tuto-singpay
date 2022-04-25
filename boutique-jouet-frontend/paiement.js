const apiURL = "http://localhost:9024";


//Action à réaliser au chargement de la page
window.addEventListener("load", async () => {
  await loadJouet();
});


//Fonction de récupération et appel de la fonction d'affichage des articles
async function loadJouet() {

  let params = new URLSearchParams(document.location.search);
  const id = params.get("id");
  const res = await fetch(apiURL + "/articles/" + id);

  if (res.status == 200) {
    displayJouet(await res.json());
  } else {
    alert("Problème de connexion à internet, veuillez rafraichir la page :o)");
  }
}

//Fonction d'affichage des articles
function displayJouet(jouets) {
  const root = document.getElementById("jouet");
  let str = `
      <div class="jouet">
          <img src="${jouets.img}" alt="Image du jouet">
          <h2>${jouets.name}</h2>
          <p>${jouets.amount} FCFA</p>
          <button onclick="paye(${jouets.id})">Payer à nouveau</button>   
      </div>
    `;
  root.innerHTML = str;
}

async function paye(articleId){
  const res = await fetch(apiURL + "/paiement/" + articleId);
  if(res.status == 200){
    const result = await res.json();
    console.log(result);
    if(result.success){
      location.href = result.result.link;
    } else {
      alert("Echec de l'initialisation du paiement. Veuillez enregistrer votre commande, nous vous recontacterons.");
    }
  } else {
    alert("Problème de connexion à internet, veuillez rafraichir la page :o)");
  }
}