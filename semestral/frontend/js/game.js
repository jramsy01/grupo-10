(() => {
    const App = (() => {
        const htmlElements = {
            btnLogout: document.querySelector(".logout"),
            title: document.querySelector(".logo"),
            openLoginBtn: document.querySelector("#openLogin"),
            loginDialog: document.querySelector("#loginDialog"),
            closeLogin: document.querySelector("#closeLogin"),
            loginForm: document.querySelector("#loginForm"),
            msgError: document.querySelector("#errorMessage"),
            msgSuccess: document.querySelector("#successMessage"),
            playerName: document.querySelector("#playerName"),
            passBtn: document.querySelector("#passBtn"),
            restartBtn: document.querySelector("#restartBtn"),
            host: document.querySelector("#host"),
            rival: document.querySelector("#rival"),
        }

        const methods = {
            checkSession: () => {
                if(sessionStorage.getItem("username") !== null){
                    const title = htmlElements.title;
                    const host = htmlElements.host;
                    const username = sessionStorage.getItem("username");
                    methods.clean(title);
                    methods.print(title, `♜ Hashing Chess ♜ - ${username}`);
                    methods.clean(host);
                    methods.print(host, `Host: ${username}`);

                    if(sessionStorage.getItem("username2") !== null){
                        methods.clean(rival);
                        methods.print(rival,`Rival: ${sessionStorage.getItem("username2")}`);
                    }
                }
                else{
                    window.location.href = 'index.html';
                }
            },
            logIn: async (email, password) => {
                try{
                    if (email !== sessionStorage.getItem("email")){
                        const response = await fetch('http://localhost:3000/api/v1/login/' + email);
                        const data = await response.json();
                    
                        if (data.correo !== email || data.contrasena !== methods.hashPass(password).toString()){
                            methods.SuccessMsg(0);
                            methods.ErrorMsg(1);
                            methods.clean(htmlElements.msgError);
                            methods.print(htmlElements.msgError, `<p>Correo o contraseña incorrecta</p>`);
                                
                        }
                        else{
                            sessionStorage.setItem("username2", data.nombre_usuario);
                            const rival = htmlElements.rival;
                            methods.clean(rival);
                            methods.print(rival,`Rival: ${sessionStorage.getItem("username2")}`);
                            handlers.closeDialog();
                        }
                    }
                    else{
                        methods.SuccessMsg(0);
                        methods.ErrorMsg(1);
                        methods.clean(htmlElements.msgError);
                        methods.print(htmlElements.msgError, `<p>El correo ya esta en uso</p>`);
                    }
                    

                }catch (err){
                    console.error('Error:',err);
                }
                
            },
            hashPass: (pass) => {
                let hash = 0;
                for(let i = 0; i < pass.length; i++){
                    let chr = pass.charCodeAt(i);
                    hash = (hash << 5) - hash + chr;
                    hash |= 0;
                }
                return hash;
            },
            ErrorMsg: (n) => {
                if(n === 1){
                    htmlElements.msgError.style.display = "block";
                }
                else{
                    htmlElements.msgError.style.display = "none";
                }  
            },
            SuccessMsg: (n) => {
                if( n === 1){
                    htmlElements.msgSuccess.style.display = "block";
                }
                else{
                    htmlElements.msgSuccess.style.display = "none";
                } 
            },
            logOut: () => {
                sessionStorage.clear();
                window.location.href = 'index.html';
                
            },
            clean: (element) => {
                element.innerHTML = "";
            },
            print: (element, text) => {
                element.innerHTML += `${text}`;
            },
        }

        const handlers = {
            loadPage: () => {
                methods.checkSession();
            },
            closeSession: () => {
                methods.logOut();
            },
            openDialog: () => {
                htmlElements.loginDialog.showModal();
            },
            closeDialog: () => {
                htmlElements.loginDialog.close();
            },
            loginSubmit: (e) => {
                e.preventDefault();
                if (!loginForm.checkValidity()) {
                    loginForm.reportValidity();
                    return;
                }
                const email = htmlElements.loginForm.email.value;
                const password = htmlElements.loginForm.password.value;
                methods.logIn(email, password);
            }
            
        };

        return {
            init: () => {
                handlers.loadPage();
                htmlElements.btnLogout.addEventListener('click',handlers.closeSession);
                htmlElements.openLoginBtn.addEventListener('click',handlers.openDialog);
                htmlElements.closeLogin.addEventListener('click',handlers.closeDialog);
                htmlElements.loginForm.addEventListener('submit',handlers.loginSubmit);
            }
        }
    })();
    App.init();
})();