FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    METIS_TCP_NODELAY=1 \
    METIS_SO_KEEPALIVE=1 \
    PORT=8000

WORKDIR /app

COPY ingress_worker/requirements.txt ./ingress_worker/requirements.txt
RUN pip install --no-cache-dir -r ingress_worker/requirements.txt

COPY ingress_worker ./ingress_worker

EXPOSE 8000

CMD ["sh", "-c", "uvicorn ingress_worker.main:app --host 0.0.0.0 --port ${PORT:-8000} --timeout-keep-alive 600"]
