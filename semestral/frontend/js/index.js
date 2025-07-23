(() => {
    const App = (() => {
        const htmlElements = {
            btnLogin: document.querySelector(".login"),
            btnPlay: document.querySelector(".play"),
        }

        const methods = {
            
        }

        const handlers = {
            loadLogin: () => {
                window.location.href = 'login.html';
            },
            loadSignup: () => {
                window.location.href = 'login.html';
                
            },
            loadGame: () => {
                window.location.href = 'game.html';
            }
        };

        return {
            init: () => {
                htmlElements.btnLogin.addEventListener('click',handlers.loadLogin);
                htmlElements.btnPlay.addEventListener('click',handlers.loadGame);

            }
        }
    })();
    App.init();
})();