from BackEnd.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):

    id = db.Column(db.Integer, primaty_key =True)
    email = db.Column(db.String(120), unique=True, nullabrle=False)

    check_password_hash = db.Column(db.String(128), nullable=False)


    def setar_senha(self, senha):
        self.check.password_hash = generate_password_hash(senha)

    def verificar_senha(self, senha):
        return check_password_hash(self.check_password_hash, senha)
    
    
    def __repr__(self):
        return f'<User {self.email}>'
        
