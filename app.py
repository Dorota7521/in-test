from flask import Flask, render_template
from flask_socketio import SocketIO
from tqdm import tqdm
from time import sleep
import psutil
import threading
import os
from algorithms.aes import encrypt_aes
from algorithms.rsa import generate_rsa_keypair, save_rsa_key_to_file, load_rsa_key_from_file, encrypt_rsa
from algorithms.chacha20 import encrypt_chacha20

app = Flask(__name__)
socketio = SocketIO(app)

# PID procesu, którego postęp chcesz monitorować
target_pid = os.getpid()  # Zmień to na rzeczywisty PID

def monitor_progress():
    with tqdm(total=100, desc='cpu%', position=1, leave=False, file=open(os.devnull, 'w')) as cpubar, \
            tqdm(total=100, desc='ram%', position=0, leave=False, file=open(os.devnull, 'w')) as rambar, \
            tqdm(total=100, desc='disk%', position=2, leave=False, file=open(os.devnull, 'w')) as diskbar:
        while True:
            # Pobierz informacje o procesie o określonym PID
            process = psutil.Process(target_pid)

            # Aktualizuj paski postępu na podstawie obciążenia CPU i pamięci RAM procesu
            cpubar.n = process.cpu_percent(interval=0.5)
            rambar.n = process.memory_percent()

            # Informacje o dysku
            disk_usage = psutil.disk_usage('/')
            diskbar.n = disk_usage.percent

            socketio.emit('update_progress', {'cpu': cpubar.n, 'ram': rambar.n, 'disk': diskbar.n}, namespace='/test')

            rambar.refresh()
            cpubar.refresh()
            diskbar.refresh()
            sleep(0.5)

def start_another_app():
    # Uruchom inną aplikację Pythona po 5 sekundach
    sleep(5)

    # aplikacja szyfrująca aes.py
    key = os.urandom(32)
    plik = 'secret_message.txt' #plik do zaszyfrowania
    encrypt_aes(key, plik)  

    #aplikacja szyfrująca rsa.py
    private_key_file = 'private_key.pem'
    if not os.path.exists(private_key_file):
        private_key, public_key = generate_rsa_keypair()
        save_rsa_key_to_file(private_key, private_key_file, password=b'MySecurePassword')
        save_rsa_key_to_file(public_key, 'public_key.pem')

    # # Wczytaj klucz prywatny
    loaded_private_key = load_rsa_key_from_file(private_key_file, password=b'MySecurePassword')

    encrypt_rsa(loaded_private_key, plik)    

    #aplikacja szyfrująca chacha20
    encrypt_chacha20(key, plik)
    
    
    sleep(5)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect', namespace='/test')
def test_connect():
    print('Client connected')

if __name__ == '__main__':
    # Uruchom wątek monitorowania postępu
    monitor_thread = threading.Thread(target=monitor_progress, daemon=True)
    monitor_thread.start()

    # Uruchom wątek startujący inną aplikację
    start_app_thread = threading.Thread(target=start_another_app)
    start_app_thread.start()

    # Uruchom serwer Flask-SocketIO
    socketio.run(app, debug=True)