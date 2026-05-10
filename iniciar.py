"""iniciar.py — Lanza CommSim v2 y abre dos pestañas."""
import subprocess, sys, time, webbrowser, os
PUERTO = 5000
def main():
    print(f"\n{'═'*48}\n  CommSim v2 — Iniciando...\n{'═'*48}")
    proc = subprocess.Popen(
        [sys.executable, "servidor.py", "--puerto", str(PUERTO)],
        cwd=os.path.dirname(os.path.abspath(__file__)))
    time.sleep(2)
    webbrowser.open(f"http://localhost:{PUERTO}/?nodo=A")
    time.sleep(0.8)
    webbrowser.open(f"http://localhost:{PUERTO}/?nodo=B")
    print(f"  Nodo A: http://localhost:{PUERTO}/?nodo=A")
    print(f"  Nodo B: http://localhost:{PUERTO}/?nodo=B")
    print("  Ctrl+C para detener.\n")
    try: proc.wait()
    except KeyboardInterrupt: proc.terminate(); print("  Detenido.")
if __name__ == "__main__": main()
