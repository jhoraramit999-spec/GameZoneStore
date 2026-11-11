from flask import Flask,render_template,request,redirect,session,jsonify
import sqlite3
from werkzeug.security import generate_password_hash,check_password_hash
app=Flask(__name__)
app.secret_key="gamezone-local-secret-change-before-publishing"
DB="database.db"
def connect():
 c=sqlite3.connect(DB);c.row_factory=sqlite3.Row;return c
with connect() as c:
 c.execute("CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,username TEXT UNIQUE,password TEXT)")
 c.execute("CREATE TABLE IF NOT EXISTS games(id INTEGER PRIMARY KEY,name TEXT,price INTEGER,image TEXT,description TEXT)")
 if not c.execute("SELECT COUNT(*) FROM games").fetchone()[0]:
  c.executemany("INSERT INTO games(name,price,image,description) VALUES(?,?,?,?)",[("Cyberpunk 2077",2499,"https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600","Open world RPG"),("Forza Horizon 5",1999,"https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600","Racing game"),("Minecraft",999,"https://images.unsplash.com/photo-1587573089734-599851b7a6d2?w=600","Build your world"),("GTA V",1499,"https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=600","Open world action")])
@app.route("/")
def home():
 with connect() as c: games=c.execute("SELECT * FROM games").fetchall()
 return render_template("index.html",games=games,user=session.get("user"))
@app.route("/register",methods=["GET","POST"])
def register():
 if request.method=="POST":
  try:
   with connect() as c:c.execute("INSERT INTO users(username,password) VALUES(?,?)",(request.form["username"],generate_password_hash(request.form["password"])))
   return redirect("/login")
  except sqlite3.IntegrityError:return "Username already exists"
 return render_template("auth.html",mode="Register")
@app.route("/login",methods=["GET","POST"])
def login():
 if request.method=="POST":
  with connect() as c:u=c.execute("SELECT * FROM users WHERE username=?",(request.form["username"],)).fetchone()
  if u and check_password_hash(u["password"],request.form["password"]):session["user"]=u["username"];return redirect("/")
  return "Invalid username or password"
 return render_template("auth.html",mode="Login")
@app.route("/logout")
def logout():session.clear();return redirect("/")
@app.route("/api/order",methods=["POST"])
def order():
 if not session.get("user"):return jsonify(error="Login first"),401
 return jsonify(message="Demo checkout only. Payment gateway is not connected."),400
if __name__=="__main__":app.run(host="127.0.0.1",port=5000)
