import mongoose from 'mongoose';
const {Schema} = mongoose;

const UserSchema = new Schema({
    nombre_usuario: {type: String, required: true},
    correo: {type: String, required: true, unique: true},
    contrasena: {type: String, required: true},
    monedas: {type: Number, defaul: 0},
    victorias: {type: Number, default: 0},
    derrotas: {type: Number, default: 0},
    partidas_jugadas: {type: Number, default: 0},
});

const Users = mongoose.model('Users', UserSchema);

export {Users};