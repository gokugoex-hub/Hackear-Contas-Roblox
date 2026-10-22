
/* ==========================================
   APPWRITE — CONFIGURAÇÃO
========================================== */

const APPWRITE_ENDPOINT = "https://fra.cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = "6ada7aa1001450ff7d9d";
const APPWRITE_DATABASE_ID = "6ada7abb000733a2fe04";

const TABELA_CONFIGURACOES = "6ada7ae8002e8c4d34e7";
const TABELA_RESPOSTAS = "6ada7bfa00315f60f5b6";
const BUCKET_SITE_FILES = "6ada8027003cad83633d";

let client;
let account;
let tablesDB;
let storage;
let configRow = null;


/* ==========================================
   CARREGAR SDK SEM ALTERAR O HTML
========================================== */

function carregarSDKAppwrite() {
    return new Promise((resolve, reject) => {
        if (window.Appwrite) {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/appwrite@29.1.0";
        script.onload = () => {
            if (window.Appwrite) {
                resolve();
            } else {
                reject(new Error("O SDK do Appwrite não foi carregado."));
            }
        };

        script.onerror = () => {
            reject(new Error("Não foi possível carregar o SDK do Appwrite."));
        };

        document.head.appendChild(script);
    });
}


/* ==========================================
   INICIALIZAR
========================================== */

async function iniciarAppwrite() {
    await carregarSDKAppwrite();

    client = new Appwrite.Client()
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT_ID);

    account = new Appwrite.Account(client);
    tablesDB = new Appwrite.TablesDB(client);
    storage = new Appwrite.Storage(client);
}


/* ==========================================
   MENSAGENS DE ERRO
========================================== */

function mostrarErro(acao, erro) {
    console.error(acao, erro);

    alert(
        acao +
        "\n\n" +
        (erro?.message || "Erro desconhecido.") +
        "\n\nConfira as permissões do Appwrite e os IDs configurados."
    );
}


/* ==========================================
   VERIFICAR LOGIN
========================================== */

async function verificarLogin() {
    try {
        await iniciarAppwrite();

        await account.get();
        mostrarPainel();
    } catch (erro) {
        mostrarLogin();
    }
}


/* ==========================================
   LOGIN
========================================== */

async function entrar() {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const mensagem = document.getElementById("login-mensagem");

    if (!email || !senha) {
        mensagem.innerText = "Digite o e-mail e a senha.";
        return;
    }

    mensagem.innerText = "Entrando...";

    try {
        if (!account) {
            await iniciarAppwrite();
        }

        await account.createEmailPasswordSession({
            email,
            password: senha
        });

        mensagem.innerText = "";
        mostrarPainel();
    } catch (erro) {
        console.error("Erro no login:", erro);
        mensagem.innerText = "Não foi possível entrar. Confira o e-mail, a senha e a configuração do Appwrite.";
    }
}


/* ==========================================
   MOSTRAR PAINEL
========================================== */

function mostrarPainel() {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("painel-container").style.display = "block";

    mostrarAba("respostas");
}


/* ==========================================
   MOSTRAR LOGIN
========================================== */

function mostrarLogin() {
    document.getElementById("login-container").style.display = "block";
    document.getElementById("painel-container").style.display = "none";
}


/* ==========================================
   SAIR
========================================== */

async function sair() {
    try {
        if (account) {
            await account.deleteSession({ sessionId: "current" });
        }
    } catch (erro) {
        console.error("Erro ao sair:", erro);
    }

    mostrarLogin();
}


/* ==========================================
   ABAS
========================================== */

function mostrarAba(nome) {
    document.querySelectorAll(".aba").forEach(aba => {
        aba.style.display = "none";
    });

    const selecionada = document.getElementById(nome);

    if (selecionada) {
        selecionada.style.display = "block";
    }

    if (nome === "respostas") {
        carregarRespostas();
    }

    if (nome === "editar") {
        carregarConfiguracoes();
    }
}


/* ==========================================
   CARREGAR RESPOSTAS
========================================== */

async function carregarRespostas() {
    const container = document.querySelector(".resposta-card");

    if (!container || !tablesDB) return;

    container.innerHTML = "<p>Carregando respostas...</p>";

    try {
        const resultado = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABELA_RESPOSTAS,
            queries: [
                Appwrite.Query.orderDesc("$createdAt"),
                Appwrite.Query.limit(100)
            ]
        });

        const respostas = resultado.rows || [];

        if (respostas.length === 0) {
            container.innerHTML = "<p>Nenhuma resposta ainda.</p>";
            return;
        }

        container.innerHTML = "";

        respostas.forEach(resposta => {
            const r1 = resposta.resposta_1 || "";
            const r2 = resposta.resposta_2 || "";
            const textoCompleto = r1 + "\n" + r2;

            const card = document.createElement("div");
            card.className = "resposta-item resposta-card";

            const data = resposta.$createdAt
                ? new Date(resposta.$createdAt).toLocaleString("pt-BR")
                : "Data não disponível";

            card.innerHTML = `
                <p><strong>Resposta 1:</strong></p>
                <p class="texto-resposta">${escapeHtml(r1)}</p>
                <button type="button" class="botao-copiar">Copiar resposta 1</button>

                <p><strong>Resposta 2:</strong></p>
                <p class="texto-resposta">${escapeHtml(r2)}</p>
                <button type="button" class="botao-copiar">Copiar resposta 2</button>

                <button type="button" class="botao-copiar">Copiar as duas</button>
                <button type="button" class="botao-excluir">Excluir</button>

                <p class="data-resposta">Enviado em: ${escapeHtml(data)}</p>
                <hr>
            `;

            const botoes = card.querySelectorAll("button");

            botoes[0].addEventListener("click", () => copiarTexto(r1));
            botoes[1].addEventListener("click", () => copiarTexto(r2));
            botoes[2].addEventListener("click", () => copiarTexto(textoCompleto));
            botoes[3].addEventListener("click", () => excluirResposta(resposta.$id));

            container.appendChild(card);
        });
    } catch (erro) {
        mostrarErro("Erro ao carregar respostas.", erro);
        container.innerHTML = "<p>Não foi possível carregar as respostas. Confira as permissões.</p>";
    }
}


/* ==========================================
   ESCAPAR HTML
========================================== */

function escapeHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto == null ? "" : String(texto);
    return div.innerHTML;
}


/* ==========================================
   COPIAR TEXTO
========================================== */

async function copiarTexto(texto) {
    try {
        await navigator.clipboard.writeText(String(texto));
        alert("Copiado com sucesso!");
    } catch (erro) {
        console.error("Erro ao copiar:", erro);
        alert("Não foi possível copiar. Confira as permissões do navegador.");
    }
}


/* ==========================================
   EXCLUIR RESPOSTA
========================================== */

async function excluirResposta(id) {
    if (!confirm("Tem certeza que deseja excluir esta resposta?")) return;

    try {
        await tablesDB.deleteRow({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABELA_RESPOSTAS,
            rowId: id
        });

        alert("Resposta excluída!");
        await carregarRespostas();
    } catch (erro) {
        mostrarErro("Erro ao excluir resposta.", erro);
    }
}


/* ==========================================
   CARREGAR CONFIGURAÇÕES
========================================== */

async function carregarConfiguracoes() {
    if (!tablesDB) return;

    try {
        const resultado = await tablesDB.listRows({
            databaseId: APPWRITE_DATABASE_ID,
            tableId: TABELA_CONFIGURACOES,
            queries: [Appwrite.Query.limit(1)]
        });

        configRow = resultado.rows?.[0] || null;

        const pergunta1 = document.getElementById("editar-pergunta1");
        const pergunta2 = document.getElementById("editar-pergunta2");

        if (pergunta1) {
            pergunta1.value = configRow?.pergunta_1 || "";
        }

        if (pergunta2) {
            pergunta2.value = configRow?.pergunta_2 || "";
        }

        if (!configRow) {
            console.warn(
                "A tabela configuracoes ainda não possui uma linha. " +
                "Ao salvar, o painel tentará criar uma."
            );
        }
    } catch (erro) {
        mostrarErro("Erro ao carregar configurações.", erro);
    }
}


/* ==========================================
   ENVIAR ARQUIVO AO STORAGE
========================================== */

async function enviarArquivo(arquivo) {
    const resultado = await storage.createFile({
        bucketId: BUCKET_SITE_FILES,
        fileId: Appwrite.ID.unique(),
        file: arquivo
    });

    const url = storage.getFileView({
        bucketId: BUCKET_SITE_FILES,
        fileId: resultado.$id
    });

    return url.toString();
}


/* ==========================================
   SALVAR CONFIGURAÇÕES
========================================== */

async function salvarConfiguracoes() {
    const campoPergunta1 = document.getElementById("editar-pergunta1");
    const campoPergunta2 = document.getElementById("editar-pergunta2");
    const campoWallpaper = document.getElementById("editar-wallpaper");
    const campoMusica = document.getElementById("editar-musica");

    const pergunta1 = campoPergunta1.value.trim();
    const pergunta2 = campoPergunta2.value.trim();

    if (!pergunta1 || !pergunta2) {
        alert("Preencha as duas perguntas.");
        return;
    }

    const botao = document.querySelector(
        '#editar button[onclick="salvarConfiguracoes()"]'
    );

    if (botao) {
        botao.disabled = true;
        botao.innerText = "SALVANDO...";
    }

    try {
        const atualizacao = {
            pergunta_1: pergunta1,
            pergunta_2: pergunta2
        };

        const wallpaper = campoWallpaper?.files?.[0];
        const musica = campoMusica?.files?.[0];

        if (wallpaper) {
            if (!wallpaper.type.startsWith("image/")) {
                throw new Error("Escolha um arquivo de imagem válido para o wallpaper.");
            }

            atualizacao.wallpaper_url = await enviarArquivo(wallpaper);
        }

        if (musica) {
            if (!musica.type.startsWith("audio/")) {
                throw new Error("Escolha um arquivo de áudio válido para a música.");
            }

            atualizacao.musica_url = await enviarArquivo(musica);
        }

        if (configRow?.$id) {
            configRow = await tablesDB.updateRow({
                databaseId: APPWRITE_DATABASE_ID,
                tableId: TABELA_CONFIGURACOES,
                rowId: configRow.$id,
                data: atualizacao
            });
        } else {
            configRow = await tablesDB.createRow({
                databaseId: APPWRITE_DATABASE_ID,
                tableId: TABELA_CONFIGURACOES,
                rowId: Appwrite.ID.unique(),
                data: atualizacao
            });
        }

        campoWallpaper.value = "";
        campoMusica.value = "";

        alert("Configurações salvas com sucesso!");
    } catch (erro) {
        mostrarErro("Não foi possível salvar as configurações.", erro);
    } finally {
        if (botao) {
            botao.disabled = false;
            botao.innerText = "💾 SALVAR ALTERAÇÕES";
        }
    }
}


/* ==========================================
   INICIAR PAINEL
========================================== */

verificarLogin();
