let tabAtual = 'carro';      // qual tab está ativa

let buscaTravada = false; // true depois de pesquisar, até clicar "Limpar"






function buscarJSONP(url){

  return new Promise((resolve, reject) => {
    const nome = 'cb_' + Date.now();
    const script = document.createElement('script');
    script.src = url + '&callback=' + nome;
    window[nome] = (data) => {
      resolve(data);
      delete window[nome];
      script.remove();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

}


// VALIDAÇÃO DE INPUT — só números
// ════════════════════════════════════════════════════════════
// Remove qualquer caractere que não seja dígito.
// maxLen é opcional (usado no campo Carro, que tem só 3 dígitos: 000–999)

function apenasNumeros(input, maxLen){
  let v = input.value.replace(/\D/g, '');
  if(maxLen) v = v.slice(0, maxLen);
  input.value = v;
}




// DEIXAR O INPUT MAIS INTERATIVO
//LIGA OU DESLIGA o botao, se tem texto ou nao

function onInputChange(inputId, btnId){
  const valor = document.getElementById(inputId).value.trim();
  document.getElementById(btnId).disabled = valor.length === 0 || buscaTravada;


}

//APERTAR ENTER no teclado também fará pesquisar o dado
function onEnterKey(event, btnId) {
  if (event.key === 'Enter') {
    event.preventDefault();
    const btn = document.getElementById(btnId);
    if (!btn.disabled) Pesquisar(event);
  }
}


//TREME campo quando o usuario tentar buscar algo vazio

function tremeCampo(inputId){
  const campo = document.getElementById(inputId);
  campo.classList.remove('shake');

  void campo.offsetWidth; // força reflow para reiniciar a animação
  campo.classList.add('shake');
  campo.focus();

}

//efeito ONDA ao clicar no botao
function criarOnda(event, btn){
  const antigo = btn.querySelector('.ripple');
  if(antigo) antigo.remove();


  const rect = btn.getBoundingClientRect();
  const tamanho = Math.max(rect.width, rect.height);
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.width = ripple.style.height = tamanho + 'px';
  ripple.style.left = (event.clientX - rect.left - tamanho / 2) + 'px';
  ripple.style.top = (event.clientY - rect.top - tamanho / 2) + 'px';
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 500);
}




function trocarAba(btn) {
  // 1. Remove a classe "active" de todos os botões
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  // 2. Adiciona "active" só no botão clicado
  btn.classList.add('active');

  // 3. Atualiza a variável de controle
  tabAtual = btn.dataset.tab; // pega o valor do atributo data-tab="carro"

  // 4. Esconde todos os painéis, mostra só o da tab ativa
  ['carro','sr','matricula'].forEach(t => {
    document.getElementById('tab-' + t).classList.toggle('visible', t === tabAtual);
  });

  // 5. Limpa resultados e estado
  document.getElementById('resultados').innerHTML = '';
 
  
  limparBusca(); //Se eu troco de aba, vai resetar a busca e os dados atuais

}



// ════════════════════════════════════════════════════════════
// TRAVAR / LIMPAR BUSCA
// Regra: depois de pesquisar, os campos ficam bloqueados.
// Só "Limpar" libera para uma nova pesquisa.
// ════════════════════════════════════════════════════════════



function travarBusca(){
  buscaTravada = true;
  ['input-carro', 'input-sr', 'input-matricula'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.disabled = true;
  });

  ['btn-carro', 'btn-sr', 'btn-matricula'].forEach(id =>{
    const el = document.getElementById(id);
    if(el) el.disabled = true; // volta a ficar desabilitado até digitar algo de novo

  });

 
}


function limparBusca(){
  buscaTravada = false;

  //limpar campos
  ['input-carro', 'input-sr', 'input-matricula'].forEach(id=>{
    const campo = document.getElementById(id);

    if(campo){
      campo.value = '';
      campo.disabled = false;
    }
  });

  //limpa resultados
  document.getElementById('resultados').innerHTML = '';

  //Reativa botoes

  onInputChange('input-carro', 'btn-carro');
  onInputChange('input-sr', 'btn-sr');
  onInputChange('input-matricula', 'btn-matricula');

}


function mostrarErro(mensagem){

    const div = document.getElementById("resultados");

    div.innerHTML = `
        <div class="estado-msg erro">
            ❌ ${mensagem}
        </div>
    `;
}


//FUNÇÃO PRINCIPAL:

async function Pesquisar(event) {

 


  if(buscaTravada) return; //proteção extra ????


  //Funciona tanto clicando como também apertando Enter 
  const btn = document.getElementById(
      tabAtual === 'carro' ? 'btn-carro' :
      tabAtual === 'sr' ? 'btn-sr' :
      "btn-matricula"
  );

  
  
  criarOnda(event, btn);

  //Identifica qual input PERTENCE A ABA ATIVA:
  const inputId = tabAtual === 'carro' ? 'input-carro'
                  : tabAtual === 'sr' ? 'input-sr'
                  : 'input-matricula';

  const valor = document.getElementById(inputId).value.trim();
  
  if(!valor){
    tremeCampo(inputId);
    return mostrarErro(`ERRO, digite um valor válido para ${tabAtual === 'carro' ? 'o carro' : tabAtual === 'sr' ? 'a SR' : 'a matrícula'}.`);
  }


  // validação extra pro carro: precisa ter exatamente 3 dígitos
  if(tabAtual==='carro' && valor.length !== 3){
    tremeCampo(inputId);
    mostrarErro(inputId, 'O número do carro está errado, deve conter até 3 dígitos (ex:002).');
    return;
  }
  
  
  //ativa STATUS CARREGANDO no botao
  btn.classList.add("loading");
  mostrarLoading();








  let params = new URLSearchParams();
  params.append('tipo', tabAtual); // carro, sr ou matricula
  params.append(tabAtual, valor);




  // 3. Chama a API (Apps Script) COLOCAR O LINK DA PLANILHA SHEETS AQUI

  try {
    const API_URL = 'https://script.google.com/macros/s/AKfycby0JBf1iCEASGw0-HijLUSpzlb75sZdQQlNvzTl4C7fNiNAt4iXUrPczgSp_QCjGERMjw/exec'; // ← url do sheets gerado pelo apps script
    const data = await buscarJSONP(`${API_URL}?${params.toString()}`);
    renderResultados(data);
  } catch (e) {   //MODO TESTE, QUANDO ESTIVER TUDO PRONTO, REMOVE AQUI
    mostrarErro('Erro ao buscar dados. Tente novamente mais tarde.');
    
  }finally{


    btn.classList.remove("loading");
    esconderLoading();

    travarBusca(); // bloqueia os campos e botões até clicar "Limpar"
  }
}







function renderResultados(dados) {
  const div = document.getElementById('resultados');


  if(!dados || dados.length === 0){
    div.innerHTML = `<div class="estado-msg">🔍 ERRO, nenhuma SR encontrada.<br>Verifique os dados e tente novamente.</div>`;
    return;

  }

  let html = `
    <div class="resultado-header">
      <span class="resultado-titulo">Resultados encontrados</span>
      <span class="resultado-count">${dados.length} SR${dados.length > 1 ? 's' : ''}</span>
      </div>`;



  dados.forEach((sr, i) =>{
    const atendida = sr.situacao?.toLowerCase() === 'atendida';
    const badgeClass = atendida ? 'badge-atendida' : 'badge-pendente';
    const badgeLabel = atendida ? '✔ Atendida' : '⚠ Pendente';
    
    html += `
       <div class="sr-card" style="animation-delay:${i * 0.05}s">
        <div class="sr-info">
          <div class="sr-numero">SR ${sr.codigo}</div>
          <div class="sr-problema">${sr.problema || '—'}</div>
          <div class="sr-meta">
            <span class="meta-tag">🚌 Carro ${sr.carro}</span>
            ${sr.garagem ? `<span class="meta-tag">🏢 ${sr.garagem}</span>` : ''}
            ${sr.motivo ? `<span class="meta-tag">⚙️ ${sr.motivo}</span>` : ''}
          </div>
        </div>
        <span class="badge ${badgeClass}">${badgeLabel}</span>
      </div>`;
  });

    div.innerHTML = html;
  }



function mostrarLoading(){
    document
      .getElementById("loading-overlay")
      .classList.add("ativo");

}

function esconderLoading(){
    document
      .getElementById("loading-overlay")
      .classList.remove("ativo");

}


function abrirDashboard(){

    document
    .getElementById("dashboardPowerBI")
    .style.display = "block";

}

