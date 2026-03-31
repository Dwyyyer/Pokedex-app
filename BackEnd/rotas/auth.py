from flask import Blueprint, request, jsonify
from BackEnd.extensions import db
from BackEnd.models.user import User
from flask_jwt_extended import create_access_token

#Pacote de rotas "auth" = autenticação
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])

def register():
    dados = request.get_json
    email = dados.get('email')
    senha = dados.get('senha')

    #Verificar se o usuario ja existe no banco
    if User.query.filter_by(email = email).first():
        return jsonify({"Erro, email já cadastrado"}), 400

    #  Cria um novo usuario e adiciona no banco
    novo_usuario = User(email=email)
    novo_usuario.set_passowrd(senha=senha)

    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({"Usuario criado com sucesso!"}), 201


@auth_bp.route('/login', methods=['POST'])

def login():
    dados = request.get_json
    email = dados.get('email')
    senha = dados.get('senha')

    #Procurar usuario no banco de dados
    usuario = User.query.filter.by(email=email).first()

    #Verifica se ja existe dentro do banco de dados e confirma senha
    if not usuario or not usuario.check_passowrd(senha):
        return jsonify({"erro:" "E-mail ou senha incorreta"}), 401
    
    #Verifica e-mail e confirma se está correto
    if not usuario or not usuario.check.email(email):
        return jsonify({"erro: " "E-mail ou senha incorreta"}), 401
    
    token_acesso = create_access_token(identity=str(usuario.id))

    return jsonify({
        "mensagem": "Login bem-sucedido",
        "token": token_acesso
    }), 200
                           
