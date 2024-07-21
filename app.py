from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from flask_mail import Mail, Message
from config import Config
from flask_cors import CORS
import os

app = Flask(__name__)
app.config.from_object(Config)

mail = Mail(app)
mongo = PyMongo(app)
db = mongo.db

CORS(app)

@app.route('/send-email', methods=['POST'])
def send_email():
    try:
        data = request.get_json()
        recipients = data.get('recipients')

        if not recipients:
            return jsonify({"error": "Recipients are required"}), 400

        subject = "Desarrollo web con Realidad virtual y vídeos 360º"

        for recipient in recipients:
            recipient_name = recipient.split('@')[0]
            personalized_body = f"""
            <p>Hola {recipient_name},</p>
            <p>Nos ponemos en contacto con vosotros porque creemos que nuestra experiencia en desarrollo web puede ser de gran interés para innovar en vuestras propuestas publicitarias.</p>
            <p>En nuestra web mostramos ejemplos de nuestros últimos proyectos. Usamos tecnologías web VR, integramos nuevas funcionalidades con IA y mejoramos la visibilidad y la experiencia de usuario.</p>
            <p>Nuestros servicios click en >>> <a href='https://www.canva.com/design/DAGJEZuJUzY/s3nUdsXAlqoW0fLfWuQhbw'>esta presentación</a> <<< </p>
            <p>Nuestra web: <a href='http://dimersiva.com'>dimersiva.com</a></p>
            <p>Además, realizamos todo tipo de material audiovisual necesario para elevar la estética de sus contenidos, asegurando una imagen atractiva y profesional.</p>
            <p>Nos encantaría tener la oportunidad de comentar cómo podemos colaborar. Estamos a su disposición para una reunión en la que podamos presentar nuestras ideas y responder cualquier pregunta que puedan tener.</p>
            <p>Saludos,<br>--<br>José María Vicente Pascual</p>
            <p>Desarrollador web y consultoría tecnológica</p>
            <p>quemavic@gmail.com</p>
            <p>+34 639 95 26 15</p>
            <p><a href='http://dimersiva.com'>dimersiva.com</a></p>
            <img src="https://i.postimg.cc/QCJ4Zd2r/dimersivalogo.gif" alt="Image">
            """
            msg = Message(
                subject,
                sender=app.config['MAIL_USERNAME'],
                recipients=[recipient]
            )
            msg.html = personalized_body  
            mail.send(msg)

        return jsonify({"message": "Emails sent"}), 200
    except Exception as e:
        app.logger.error('Failed to send email', exc_info=True)
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
