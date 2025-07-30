(() => {
    const App = (() => {
        const htmlElements = {
            btnLogin: document.querySelector(".login"),
            btnLogout: document.querySelector(".logout"),
            btnPlay: document.querySelector(".play"),
            title: document.querySelector(".logo"),
            btnPlayNow: document.querySelector("#playNow"),
            btnRules: document.querySelector(".rules"),
    
        }

        const methods = {
            checkSession: () => {
                if(sessionStorage.getItem("username") !== null){
                    const title = htmlElements.title;
                    const username = sessionStorage.getItem("username");
                    methods.clean(title);
                    methods.print(title, `♜ Hashing Chess ♜ - ${username}`);
                    htmlElements.btnLogin.classList.remove('active');
                    htmlElements.btnLogout.classList.add('active');
                }  
            },
            checkGameSession: () => {
                if(sessionStorage.getItem("username") !== null){
                    window.location.href = 'game.html';
                }
                else{
                    alert("Debes iniciar sesión primero antes de jugar!");
                }
            },
            logOut: () => {
                sessionStorage.clear();
                const title = htmlElements.title;
                methods.clean(title);
                methods.print(title, `♜ Hashing Chess ♜`);
                htmlElements.btnLogin.classList.add('active');
                htmlElements.btnLogout.classList.remove('active');
                
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
            loadLogin: () => {
                window.location.href = 'login.html';
            },
            loadGame: () => {
                methods.checkGameSession();
            },
            loadRules: () => {
                window.location.href = 'rules.html';
            },
            
        };

        return {
            init: () => {
                handlers.loadPage();
                htmlElements.btnLogin.addEventListener('click',handlers.loadLogin);
                htmlElements.btnPlay.addEventListener('click',handlers.loadGame);
                htmlElements.btnLogout.addEventListener('click',handlers.closeSession);
                htmlElements.btnPlayNow.addEventListener('click',handlers.loadGame);
                htmlElements.btnRules.addEventListener('click',handlers.loadRules);
            }
        }
    })();
    App.init();
})();