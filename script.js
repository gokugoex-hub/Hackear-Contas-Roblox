// ==================================================
// CONFIGURAÇÃO DO SUPABASE
// ==================================================

const SUPABASE_URL =
    "https://qvksylzjdihgrbsyhsjr.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_nV9xaUcgEfABA2ObKl8t-Q_ioBVzFpi";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==================================================
// VARIÁVEIS
// ==================================================

let musicaAtiva = false;


// ==================================================
// CARREGAR CONFIGURAÇÕES
// ==================================================

async function carregarConfiguracoes() {

    console.log("Carregando configurações...");


    const {
        data,
        error
    } =
        await supabaseClient
            .from("configuracoes")
            .select("*")
            .eq("id", 1)
            .single();


    // ==============================================
    // ERRO
    // ==============================================

    if (error) {

        console.error(
            "Erro ao carregar configurações:",
            error
        );

        return;
    }


    if (!data) {

        console.warn(
            "Nenhuma configuração encontrada."
        );

        return;
    }


    console.log(
        "Configurações carregadas:",
        data
    );


    // ==================================================
    // PERGUNTA 1
    // ==================================================

    const pergunta1 =
        document.getElementById(
            "pergunta1"
        );


    if (pergunta1) {

        pergunta1.innerText =
            data.pergunta_1 ||
            "Pergunta 1";

    }


    // ==================================================
    // PERGUNTA 2
    // ==================================================

    const pergunta2 =
        document.getElementById(
            "pergunta2"
        );


    if (pergunta2) {

        pergunta2.innerText =
            data.pergunta_2 ||
            "Pergunta 2";

    }


    // ==================================================
    // WALLPAPER
    // ==================================================

    if (data.wallpaper_url) {

        aplicarWallpaper(
            data.wallpaper_url
        );

    } else {

        console.log(
            "Nenhum wallpaper configurado."
        );

    }


    // ==================================================
    // MÚSICA
    // ==================================================

    if (data.musica_url) {

        criarMusica(
            data.musica_url
        );

    } else {

        console.log(
            "Nenhuma música configurada."
        );

    }

}


// ==================================================
// APLICAR WALLPAPER
// ==================================================

function aplicarWallpaper(url) {

    if (!url) {

        return;
    }


    console.log(
        "Aplicando wallpaper:",
        url
    );


    // ==============================================
    // Adiciona um parâmetro para evitar
    // problemas de cache quando trocar a imagem.
    // ==============================================

    const separador =
        url.includes("?")
            ? "&"
            : "?";


    const urlFinal =
        url +
        separador +
        "v=" +
        Date.now();


    // ==============================================
    // BACKGROUND
    // ==============================================

    document.body.style.backgroundImage =
        `url("${urlFinal}")`;


    document.body.style.backgroundSize =
        "cover";


    document.body.style.backgroundPosition =
        "center";


    document.body.style.backgroundRepeat =
        "no-repeat";


    document.body.style.backgroundAttachment =
        "fixed";


    // ==============================================
    // GARANTIR QUE O FUNDO OCUPE A TELA
    // ==============================================

    document.body.style.minHeight =
        "100vh";


    console.log(
        "Wallpaper aplicado com sucesso."
    );

}


// ==================================================
// CRIAR MÚSICA
// ==================================================

function criarMusica(url) {

    if (!url) {

        return;
    }


    const musica =
        document.getElementById(
            "musica-site"
        );


    const botao =
        document.getElementById(
            "botao-musica"
        );


    if (!musica) {

        console.error(
            "Elemento #musica-site não encontrado."
        );

        return;
    }


    // ==============================================
    // CONFIGURAR ÁUDIO
    // ==============================================

    musica.src = url;

    musica.loop = true;

    musica.volume = 0.5;


    // ==============================================
    // MOSTRAR BOTÃO
    // ==============================================

    if (botao) {

        botao.style.display =
            "block";


        botao.innerText =
            "🔊 Ativar música";

    }


    musicaAtiva = false;


    // ==============================================
    // TENTAR AUTOPLAY
    // ==============================================

    musica.play()
        .then(function() {

            musicaAtiva = true;


            if (botao) {

                botao.innerText =
                    "🔇 Desligar música";

            }

        })
        .catch(function(erro) {

            console.log(
                "Autoplay bloqueado pelo navegador.",
                erro
            );

        });

}


// ==================================================
// LIGAR / DESLIGAR MÚSICA
// ==================================================

async function alternarMusica() {

    const musica =
        document.getElementById(
            "musica-site"
        );


    const botao =
        document.getElementById(
            "botao-musica"
        );


    if (!musica) {

        console.error(
            "Música não encontrada."
        );

        return;
    }


    if (!musica.src) {

        console.warn(
            "Nenhuma música configurada."
        );

        return;
    }


    // ==================================================
    // DESLIGAR
    // ==================================================

    if (musicaAtiva) {

        musica.pause();

        musicaAtiva = false;


        if (botao) {

            botao.innerText =
                "🔊 Ativar música";

        }


        return;
    }


    // ==================================================
    // LIGAR
    // ==================================================

    try {

        await musica.play();


        musicaAtiva = true;


        if (botao) {

            botao.innerText =
                "🔇 Desligar música";

        }

    } catch (erro) {

        console.error(
            "Erro ao iniciar música:",
            erro
        );


        alert(
            "Não foi possível iniciar a música."
        );

    }

}


// ==================================================
// ENVIAR RESPOSTAS
// ==================================================

async function enviarRespostas() {

    const campoResposta1 =
        document.getElementById(
            "resposta1"
        );


    const campoResposta2 =
        document.getElementById(
            "resposta2"
        );


    // ==============================================
    // VERIFICAR CAMPOS
    // ==============================================

    if (
        !campoResposta1 ||
        !campoResposta2
    ) {

        alert(
            "Campos de resposta não encontrados."
        );

        return;
    }


    const resposta1 =
        campoResposta1.value.trim();


    const resposta2 =
        campoResposta2.value.trim();


    // ==============================================
    // VERIFICAR SE ESTÃO PREENCHIDOS
    // ==============================================

    if (
        !resposta1 ||
        !resposta2
    ) {

        alert(
            "Responda as duas perguntas!"
        );

        return;
    }


    // ==============================================
    // LOCALIZAR BOTÃO ENVIAR
    // ==============================================

    const botoes =
        document.querySelectorAll(
            "button"
        );


    let botaoEnviar =
        null;


    botoes.forEach(function(botao) {

        if (
            botao.innerText
                .trim()
                .toUpperCase() ===
            "ENVIAR"
        ) {

            botaoEnviar =
                botao;

        }

    });


    // ==============================================
    // DESABILITAR BOTÃO
    // ==============================================

    if (botaoEnviar) {

        botaoEnviar.disabled =
            true;


        botaoEnviar.innerText =
            "ENVIANDO...";

    }


    // ==============================================
    // ENVIAR PARA SUPABASE
    // ==============================================

    const {
        error
    } =
        await supabaseClient
            .from("respostas")
            .insert([

                {

                    resposta_1:
                        resposta1,

                    resposta_2:
                        resposta2

                }

            ]);


    // ==============================================
    // TRATAR ERRO
    // ==============================================

    if (error) {

        console.error(
            "Erro ao enviar respostas:",
            error
        );


        alert(
            "Erro ao enviar as respostas."
        );


        if (botaoEnviar) {

            botaoEnviar.disabled =
                false;


            botaoEnviar.innerText =
                "ENVIAR";

        }


        return;
    }


    // ==============================================
    // SUCESSO
    // ==============================================

    alert(
        "Respostas enviadas com sucesso! ✅"
    );


    // ==============================================
    // LIMPAR CAMPOS
    // ==============================================

    campoResposta1.value =
        "";


    campoResposta2.value =
        "";


    // ==============================================
    // RESTAURAR BOTÃO
    // ==============================================

    if (botaoEnviar) {

        botaoEnviar.disabled =
            false;


        botaoEnviar.innerText =
            "ENVIAR";

    }

}


// ==================================================
// INICIALIZAÇÃO
// ==================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "Site iniciado."
        );


        carregarConfiguracoes();

    }
);