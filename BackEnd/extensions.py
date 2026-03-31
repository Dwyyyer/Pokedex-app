from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

# 1. Cria a ferramenta do Banco de Dados (vazia, fora da tomada)
db = SQLAlchemy()

# 2. Cria a ferramenta de Segurança JWT (vazia, fora da tomada)
jwt = JWTManager()