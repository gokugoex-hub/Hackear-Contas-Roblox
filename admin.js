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
// VERIFICAR LOGIN
// ==================================================

async function verificarLogin() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    if (session) {

        mostrarPainel();

    } else {

        mostrarLogin();

    }
}


// ==================================================
// LOGIN
// ==================================================

async function entrar() {

    const email =
        document.getElementById(
            "email"
        ).value.trim();


    const senha =
        document.getElementById(
            "senha"
        ).value;


    const mensagem =
        document.getElementById(
            "login-mensagem"
        );


    if (!email || !senha) {

        mensagem.innerText =
            "Digite o e-mail e a senha.";

        return;
    }


    mensagem.innerText =
        "Entrando...";


    const {
        error
    } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: senha

        });


    if (error) {

        console.error(
            "ERRO DO SUPABASE:",
            error
        );


        mensagem.innerText =
            "E-mail ou senha incorretos.";

        return;
    }


    mensagem.innerText =
        "";


    mostrarPainel();
}


// ==================================================
// MOSTRAR PAINEL
// ==================================================

function mostrarPainel() {

    document.getElementById(
        "login-container"
    ).style.display =
        "none";


    document.getElementById(
        "painel-container"
    ).style.display =
        "block";


    carregarRespostas();

    carregarConfiguracoes();

    carregarContas();
}


// ==================================================
// MOSTRAR LOGIN
// ==================================================

function mostrarLogin() {

    document.getElementById(
        "login-container"
    ).style.display =
        "block";


    document.getElementById(
        "painel-container"
    ).style.display =
        "none";
}


// ==================================================
// SAIR
// ==================================================

async function sair() {

    await supabaseClient.auth.signOut();

    mostrarLogin();
}


// ==================================================
// ABAS
// ==================================================

function mostrarAba(nome) {

    const abas =
        document.querySelectorAll(
            ".aba"
        );


    abas.forEach(function(aba) {

        aba.style.display =
            "none";

    });


    const abaSelecionada =
        document.getElementById(
            nome
        );


    if (abaSelecionada) {

        abaSelecionada.style.display =
            "block";

    }


    // ==========================================
    // RESPOSTAS
    // ==========================================

    if (nome === "respostas") {

        carregarRespostas();

    }


    // ==========================================
    // EDITAR
    // ==========================================

    if (nome === "editar") {

        carregarConfiguracoes();

    }


    // ==========================================
    // CONTAS
    // ==========================================

    if (nome === "contas") {

        carregarContas();

    }

}


// ==================================================
// CARREGAR RESPOSTAS
// ==================================================

async function carregarRespostas() {

    const container =
        document.querySelector(
            ".resposta-card"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "<p>Carregando respostas...</p>";


    const {
        data,
        error
    } =
        await supabaseClient
            .from("respostas")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "ERRO AO CARREGAR RESPOSTAS:",
            error
        );


        container.innerHTML = `

            <p>
                Erro ao carregar respostas.
            </p>

            <p>
                ${escapeHtml(
                    error.message
                )}
            </p>

        `;

        return;
    }


    if (!data || data.length === 0) {

        container.innerHTML = `

            <p>
                Nenhuma resposta ainda.
            </p>

        `;

        return;
    }


    container.innerHTML =
        "";


    data.forEach(function(resposta) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "resposta-item";


        const dataFormatada =
            new Date(
                resposta.created_at
            ).toLocaleString(
                "pt-BR"
            );


        const textoCompleto =
            resposta.resposta_1 +
            "\n" +
            resposta.resposta_2;


        card.innerHTML = `

            <p>
                <strong>
                    Resposta 1:
                </strong>
            </p>


            <p class="texto-resposta">
                ${escapeHtml(
                    resposta.resposta_1
                )}
            </p>


            <button
                class="botao-copiar"
            >
                Copiar resposta 1
            </button>


            <p>
                <strong>
                    Resposta 2:
                </strong>
            </p>


            <p class="texto-resposta">
                ${escapeHtml(
                    resposta.resposta_2
                )}
            </p>


            <button
                class="botao-copiar"
            >
                Copiar resposta 2
            </button>


            <button
                class="botao-copiar"
            >
                Copiar as duas
            </button>


            <button
                class="botao-excluir"
            >
                Excluir
            </button>


            <p class="data-resposta">

                Enviado em:

                ${dataFormatada}

            </p>


            <hr>

        `;


        const botoes =
            card.querySelectorAll(
                "button"
            );


        // ======================================
        // COPIAR RESPOSTA 1
        // ======================================

        botoes[0].addEventListener(
            "click",
            function() {

                copiarTexto(
                    resposta.resposta_1
                );

            }
        );


        // ======================================
        // COPIAR RESPOSTA 2
        // ======================================

        botoes[1].addEventListener(
            "click",
            function() {

                copiarTexto(
                    resposta.resposta_2
                );

            }
        );


        // ======================================
        // COPIAR AS DUAS
        // ======================================

        botoes[2].addEventListener(
            "click",
            function() {

                copiarTexto(
                    textoCompleto
                );

            }
        );


        // ======================================
        // EXCLUIR
        // ======================================

        botoes[3].addEventListener(
            "click",
            function() {

                excluirResposta(
                    resposta.id
                );

            }
        );


        container.appendChild(
            card
        );

    });

}


// ==================================================
// ESCAPAR HTML
// ==================================================

function escapeHtml(texto) {

    if (
        texto === null ||
        texto === undefined
    ) {

        return "";

    }


    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(texto);


    return div.innerHTML;
}


// ==================================================
// COPIAR TEXTO
// ==================================================

async function copiarTexto(texto) {

    try {

        await navigator.clipboard.writeText(
            String(texto)
        );


        alert(
            "Copiado com sucesso!"
        );


    } catch (erro) {

        console.error(
            "ERRO AO COPIAR:",
            erro
        );


        alert(
            "Não foi possível copiar."
        );

    }

}


// ==================================================
// EXCLUIR RESPOSTA
// ==================================================

async function excluirResposta(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir esta resposta?"
        );


    if (!confirmar) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("respostas")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            "ERRO AO EXCLUIR:",
            error
        );


        alert(
            "Erro ao excluir a resposta."
        );

        return;
    }


    alert(
        "Resposta excluída!"
    );


    carregarRespostas();
}


// ==================================================
// CARREGAR CONFIGURAÇÕES
// ==================================================

async function carregarConfiguracoes() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("configuracoes")
            .select("*")
            .eq(
                "id",
                1
            )
            .single();


    if (error) {

        console.error(
            "ERRO AO CARREGAR CONFIGURAÇÕES:",
            error
        );

        return;
    }


    if (!data) {

        return;

    }


    const pergunta1 =
        document.getElementById(
            "editar-pergunta1"
        );


    const pergunta2 =
        document.getElementById(
            "editar-pergunta2"
        );


    if (pergunta1) {

        pergunta1.value =
            data.pergunta_1 || "";

    }


    if (pergunta2) {

        pergunta2.value =
            data.pergunta_2 || "";

    }

}


// ==================================================
// SALVAR CONFIGURAÇÕES
// ==================================================

async function salvarConfiguracoes() {

    const campoPergunta1 =
        document.getElementById(
            "editar-pergunta1"
        );


    const campoPergunta2 =
        document.getElementById(
            "editar-pergunta2"
        );


    const campoWallpaper =
        document.getElementById(
            "editar-wallpaper"
        );


    const campoMusica =
        document.getElementById(
            "editar-musica"
        );


    if (
        !campoPergunta1 ||
        !campoPergunta2
    ) {

        alert(
            "Campos de perguntas não encontrados."
        );

        return;
    }


    const pergunta1 =
        campoPergunta1.value.trim();


    const pergunta2 =
        campoPergunta2.value.trim();


    const wallpaper =
        campoWallpaper &&
        campoWallpaper.files.length > 0
            ? campoWallpaper.files[0]
            : null;


    const musica =
        campoMusica &&
        campoMusica.files.length > 0
            ? campoMusica.files[0]
            : null;


    if (
        !pergunta1 ||
        !pergunta2
    ) {

        alert(
            "Preencha as duas perguntas."
        );

        return;
    }


    let wallpaperUrl =
        null;


    let musicaUrl =
        null;


    // ==========================================
    // WALLPAPER
    // ==========================================

    if (wallpaper) {

        const nomeArquivo =
            "wallpaper_" +
            Date.now() +
            "_" +
            wallpaper.name;


        const {
            error
        } =
            await supabaseClient
                .storage
                .from("site-files")
                .upload(
                    "wallpaper/" +
                    nomeArquivo,

                    wallpaper,

                    {
                        upsert: true
                    }
                );


        if (error) {

            console.error(
                "ERRO WALLPAPER:",
                error
            );


            alert(
                "Erro ao enviar o wallpaper."
            );

            return;
        }


        const {
            data
        } =
            supabaseClient
                .storage
                .from("site-files")
                .getPublicUrl(
                    "wallpaper/" +
                    nomeArquivo
                );


        wallpaperUrl =
            data.publicUrl;
    }


    // ==========================================
    // MÚSICA
    // ==========================================

    if (musica) {

        const nomeArquivo =
            "musica_" +
            Date.now() +
            "_" +
            musica.name;


        const {
            error
        } =
            await supabaseClient
                .storage
                .from("site-files")
                .upload(
                    "musica/" +
                    nomeArquivo,

                    musica,

                    {
                        upsert: true
                    }
                );


        if (error) {

            console.error(
                "ERRO MÚSICA:",
                error
            );


            alert(
                "Erro ao enviar a música."
            );

            return;
        }


        const {
            data
        } =
            supabaseClient
                .storage
                .from("site-files")
                .getPublicUrl(
                    "musica/" +
                    nomeArquivo
                );


        musicaUrl =
            data.publicUrl;
    }


    // ==========================================
    // ATUALIZAÇÃO
    // ==========================================

    const atualizacao = {

        pergunta_1:
            pergunta1,

        pergunta_2:
            pergunta2

    };


    if (wallpaperUrl) {

        atualizacao.wallpaper_url =
            wallpaperUrl;

    }


    if (musicaUrl) {

        atualizacao.musica_url =
            musicaUrl;

    }


    // ==========================================
    // SALVAR
    // ==========================================

    const {
        error
    } =
        await supabaseClient
            .from("configuracoes")
            .update(
                atualizacao
            )
            .eq(
                "id",
                1
            );


    if (error) {

        console.error(
            "ERRO AO SALVAR CONFIGURAÇÕES:",
            error
        );


        alert(
            "Erro ao salvar configurações."
        );

        return;
    }


    alert(
        "Configurações salvas com sucesso!"
    );


    carregarConfiguracoes();
}


// ==================================================
// CONTAS ROBLOX
// ==================================================


// ==================================================
// CARREGAR CONTAS
// ==================================================

async function carregarContas() {

    const container =
        document.getElementById(
            "lista-contas"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "<p>Carregando contas...</p>";


    const {
        data,
        error
    } =
        await supabaseClient
            .from("contas_roblox")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "ERRO AO CARREGAR CONTAS:",
            error
        );


        container.innerHTML = `

            <p>
                Erro ao carregar contas.
            </p>

            <p>
                ${escapeHtml(
                    error.message
                )}
            </p>

        `;

        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        container.innerHTML = `

            <p>
                Nenhuma conta salva ainda.
            </p>

        `;

        return;
    }


    container.innerHTML =
        "";


    data.forEach(function(conta) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "resposta-card";


        card.style.marginTop =
            "20px";


        card.innerHTML = `

            <p>

                <strong>
                    🎮 Nick:
                </strong>

                ${escapeHtml(
                    conta.nick
                )}

            </p>


            <p>

                <strong>
                    🔒 Senha:
                </strong>

                <span
                    class="senha-conta"
                >
                    ••••••••••
                </span>

            </p>


            <p>

                <strong>
                    📧 E-mail:
                </strong>

                ${escapeHtml(
                    conta.email ||
                    "Não informado"
                )}

            </p>


            <p>

                <strong>
                    📝 Observação:
                </strong>

                ${escapeHtml(
                    conta.observacao ||
                    "Nenhuma"
                )}

            </p>


            <button>
                👁️ Mostrar senha
            </button>


            <button>
                📋 Copiar nick
            </button>


            <button>
                📋 Copiar senha
            </button>


            <button
                class="botao-excluir"
            >
                🗑️ Excluir
            </button>

        `;


        const botoes =
            card.querySelectorAll(
                "button"
            );


        const senhaElemento =
            card.querySelector(
                ".senha-conta"
            );


        let senhaVisivel =
            false;


        // ======================================
        // MOSTRAR / ESCONDER SENHA
        // ======================================

        botoes[0].addEventListener(
            "click",
            function() {

                senhaVisivel =
                    !senhaVisivel;


                if (senhaVisivel) {

                    senhaElemento.innerText =
                        conta.senha;


                    botoes[0].innerText =
                        "🙈 Esconder senha";

                } else {

                    senhaElemento.innerText =
                        "••••••••••";


                    botoes[0].innerText =
                        "👁️ Mostrar senha";

                }

            }
        );


        // ======================================
        // COPIAR NICK
        // ======================================

        botoes[1].addEventListener(
            "click",
            function() {

                copiarTexto(
                    conta.nick
                );

            }
        );


        // ======================================
        // COPIAR SENHA
        // ======================================

        botoes[2].addEventListener(
            "click",
            function() {

                copiarTexto(
                    conta.senha
                );

            }
        );


        // ======================================
        // EXCLUIR CONTA
        // ======================================

        botoes[3].addEventListener(
            "click",
            function() {

                excluirConta(
                    conta.id
                );

            }
        );


        container.appendChild(
            card
        );

    });

}


// ==================================================
// ADICIONAR CONTA
// ==================================================

async function adicionarConta() {

    const campoNick =
        document.getElementById(
            "conta-nick"
        );


    const campoSenha =
        document.getElementById(
            "conta-senha"
        );


    const campoEmail =
        document.getElementById(
            "conta-email"
        );


    const campoObservacao =
        document.getElementById(
            "conta-observacao"
        );


    if (
        !campoNick ||
        !campoSenha
    ) {

        alert(
            "Campos da conta não encontrados."
        );

        return;
    }


    const nick =
        campoNick.value.trim();


    const senha =
        campoSenha.value;


    const email =
        campoEmail
            ? campoEmail.value.trim()
            : "";


    const observacao =
        campoObservacao
            ? campoObservacao.value.trim()
            : "";


    // ==========================================
    // VALIDAR
    // ==========================================

    if (!nick || !senha) {

        alert(
            "Nick e senha são obrigatórios."
        );

        return;
    }


    // ==========================================
    // SALVAR
    // ==========================================

    const {
        error
    } =
        await supabaseClient
            .from("contas_roblox")
            .insert([

                {

                    nick:
                        nick,

                    senha:
                        senha,

                    email:
                        email || null,

                    observacao:
                        observacao || null

                }

            ]);


    if (error) {

        console.error(
            "ERRO AO ADICIONAR CONTA:",
            error
        );


        alert(
            "Erro ao salvar a conta."
        );

        return;
    }


    // ==========================================
    // LIMPAR
    // ==========================================

    campoNick.value =
        "";


    campoSenha.value =
        "";


    if (campoEmail) {

        campoEmail.value =
            "";

    }


    if (campoObservacao) {

        campoObservacao.value =
            "";

    }


    alert(
        "Conta salva com sucesso!"
    );


    carregarContas();
}


// ==================================================
// EXCLUIR CONTA
// ==================================================

async function excluirConta(id) {

    const confirmar =
        confirm(
            "Tem certeza que deseja excluir esta conta?"
        );


    if (!confirmar) {

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("contas_roblox")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(
            "ERRO AO EXCLUIR CONTA:",
            error
        );


        alert(
            "Erro ao excluir a conta."
        );

        return;
    }


    alert(
        "Conta excluída!"
    );


    carregarContas();
}


// ==================================================
// INICIAR
// ==================================================

verificarLogin();