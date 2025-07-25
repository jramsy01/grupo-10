(() => {
    const App = (() => {
        const htmlElements = {
            loginToggle: document.querySelector("#loginToggle"),
            signupToggle: document.querySelector("#signupToggle"),
            loginDiv: document.querySelector("#loginForm"),
            signupDiv: document.querySelector("#signupForm"),
            loginForm: document.querySelector("#loginFormElement"),
            signupForm: document.querySelector("#signupFormElement"),
            msgError: document.querySelector("#errorMessage"),
            msgSuccess: document.querySelector("#successMessage"),
        }

        const methods = {
            showLogin: () => {
                htmlElements.loginToggle.classList.add('active');
                htmlElements.signupToggle.classList.remove('active');
                htmlElements.loginDiv.classList.add('active');
                htmlElements.signupDiv.classList.remove('active');
            },
            showSignup: () => {
                methods.SuccessMsg(0);
                htmlElements.loginToggle.classList.remove('active');
                htmlElements.signupToggle.classList.add('active');
                htmlElements.loginDiv.classList.remove('active');
                htmlElements.signupDiv.classList.add('active');
            },
            
            signUp: async (nombre_usuario, correo, password, password2) => {
                try{
                    const response = await fetch('http://localhost:3000/api/v1/login/' + correo);
                    const data = await response.json();
                    console.log(data.mensaje);

                    if (data.mensaje != "Correo no encontrado" || password !== password2){
                        methods.ErrorMsg(1);
                        methods.clean(htmlElements.msgError);
                        methods.print(htmlElements.msgError, `<p>Verifica las contaseñas o email</p>`);
                    }
                    else{
                        const contrasena = methods.hashPass(password);
                        const formData = {nombre_usuario, correo, contrasena};
                        methods.ErrorMsg(0);
                        const response = await fetch('http://localhost:3000/api/v1/signup', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(formData),
                        });

                        const {mensaje} = await response.json();
                        methods.SuccessMsg(1);
                        methods.clean(htmlElements.msgSuccess);
                        methods.print(htmlElements.msgSuccess, `<p>${mensaje}</p>`);
                        htmlElements.signupForm.reset();
                        methods.showLogin();
                    }
                }catch (err){
                    console.error('Error:',err);
                }
            },
            logIn: async (email, password) => {
                try{
                    const response = await fetch('http://localhost:3000/api/v1/login/' + email);
                    const data = await response.json();
                    
                    if (data.correo !== email || data.contrasena !== methods.hashPass(password).toString()){
                        methods.SuccessMsg(0);
                        methods.ErrorMsg(1);
                        methods.clean(htmlElements.msgError);
                        methods.print(htmlElements.msgError, `<p>Email o contraseña incorrecta</p>`);
                            
                    }
                    else{
                        window.location.href = "index.html";
                        //Se debe iniciar una variable se sesion
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
            clean: (element) => {
                element.innerHTML = "";
            },
            print: (element, text) => {
                element.innerHTML += `${text}`;
            },
        }

        const handlers = {
            loadLogin: () => {
                methods.showLogin();
            },
            loadSignup: () => {
                methods.showSignup();
                
            },
            signupFormSubmit: (e) => {
                e.preventDefault();
                const name = htmlElements.signupForm.signupName.value;
                const email = htmlElements.signupForm.signupEmail.value;
                const password = htmlElements.signupForm.signupPassword.value;
                const password2 = htmlElements.signupForm.confirmPassword.value;
                methods.signUp(name, email, password, password2);
            },
            loginFormSubmit: (e) => {
                e.preventDefault();
                const email = htmlElements.loginForm.loginEmail.value;
                const password = htmlElements.loginForm.loginPassword.value;
                methods.logIn(email, password);
            }
        };

        return {
            init: () => {
                htmlElements.signupForm.addEventListener('submit',handlers.signupFormSubmit);
                htmlElements.loginForm.addEventListener('submit',handlers.loginFormSubmit);
                htmlElements.loginToggle.addEventListener('click',handlers.loadLogin);
                htmlElements.signupToggle.addEventListener('click',handlers.loadSignup);

            }
        }
    })();
    App.init();
})();