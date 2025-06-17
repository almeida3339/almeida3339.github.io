FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY monitor.py .
COPY dummy.py .

CMD ["sh", "-c", "uvicorn dummy:app --host 0.0.0.0 --port 8000 & python monitor.py"]