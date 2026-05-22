import logging
import uuid
from typing import Any, Dict, Optional

from databases import Database
from fastapi import Depends, FastAPI, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings


# ─── Configuración ────────────────────────────────────────────────────────────

class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://user:pass@localhost/encuestas_db"
    jwt_secret: str = "cambia-esto-en-produccion"
    jwt_algorithm: str = "HS256"

    class Config:
        env_file = ".env"

settings = Settings()
logger = logging.getLogger(__name__)

app = FastAPI(title="API Encuestas")
database = Database(settings.database_url)
security = HTTPBearer()


# ─── Ciclo de vida de la conexión ─────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


# ─── Autenticación JWT ────────────────────────────────────────────────────────

def verificar_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """
    FIX: Endpoint protegido. Verifica JWT en cada request.
    El token debe contener encuestador_id para correlacionar identidad.
    """
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        encuestador_id = payload.get("sub")
        if not encuestador_id:
            raise HTTPException(status_code=401, detail="Token inválido")
        return {"encuestador_id": encuestador_id}
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado o inválido")


# ─── Modelos de entrada ───────────────────────────────────────────────────────

class PayloadRespuesta(BaseModel):
    encuesta_id: uuid.UUID
    encuestador_id: uuid.UUID
    es_descarte: bool
    pregunta_descarte_id: Optional[int] = Field(
        None,
        description="ID de la pregunta que generó el descarte. Requerido si es_descarte=True."
    )
    respuestas: Dict[int, Any]


# ─── Endpoint principal ───────────────────────────────────────────────────────

@app.post("/api/v1/respuestas/registrar", status_code=status.HTTP_201_CREATED)
async def registrar_respuesta(
    payload: PayloadRespuesta,
    token_data: dict = Depends(verificar_token),
):
    # Verificar que el encuestador del token coincide con el del payload
    if str(payload.encuestador_id) != token_data["encuestador_id"]:
        raise HTTPException(status_code=403, detail="Encuestador no autorizado")

    # Validar que la encuesta existe y obtener su estructura para validar pregunta_ids
    encuesta = await database.fetch_one(
        "SELECT id, estructura_json FROM encuestas WHERE id = :id",
        {"id": payload.encuesta_id},
    )
    if not encuesta:
        raise HTTPException(status_code=404, detail="Encuesta no encontrada")

    # Validar pregunta_ids contra la estructura real de la encuesta
    estructura = encuesta["estructura_json"]
    ids_validos = {p["id"] for p in estructura.get("preguntas", [])}

    if not payload.es_descarte:
        ids_enviados = set(payload.respuestas.keys())
        ids_invalidos = ids_enviados - ids_validos
        if ids_invalidos:
            raise HTTPException(
                status_code=422,
                detail=f"pregunta_id inválidos para esta encuesta: {ids_invalidos}",
            )

    if payload.es_descarte and payload.pregunta_descarte_id is None:
        raise HTTPException(
            status_code=422,
            detail="pregunta_descarte_id es requerido cuando es_descarte=True",
        )

    # FIX: Todo dentro de una transacción atómica
    try:
        async with database.transaction():

            # 1. Insertar cabecera
            cabecera_id = await database.fetch_val(
                """
                INSERT INTO respuestas_cabecera
                    (encuesta_id, encuestador_id, es_descarte, pregunta_descarte_id)
                VALUES
                    (:encuesta_id, :encuestador_id, :es_descarte, :pregunta_descarte_id)
                RETURNING id
                """,
                {
                    "encuesta_id": payload.encuesta_id,
                    "encuestador_id": payload.encuestador_id,
                    "es_descarte": payload.es_descarte,
                    "pregunta_descarte_id": payload.pregunta_descarte_id,
                },
            )

            # 2. Insertar detalle solo si no es descarte y hay respuestas válidas
            if not payload.es_descarte:
                valores_detalle = [
                    {
                        "cabecera_id": cabecera_id,
                        "encuesta_id": payload.encuesta_id,
                        "pregunta_id": p_id,
                        "valor_respondido": (
                            ",".join(val) if isinstance(val, list) else str(val)
                        ),
                    }
                    for p_id, val in payload.respuestas.items()
                    if val not in (None, "", [])
                ]

                if valores_detalle:
                    await database.execute_many(
                        """
                        INSERT INTO respuestas_detalle
                            (cabecera_id, encuesta_id, pregunta_id, valor_respondido)
                        VALUES
                            (:cabecera_id, :encuesta_id, :pregunta_id, :valor_respondido)
                        """,
                        valores_detalle,
                    )

        return {"status": "success", "cabecera_id": str(cabecera_id)}

    except HTTPException:
        raise  # re-lanzar errores de negocio sin enmascarar
    except Exception as e:
        # FIX: log interno con traza completa, mensaje genérico al cliente
        logger.error(
            "Error en persistencia de respuesta. encuesta_id=%s encuestador_id=%s",
            payload.encuesta_id,
            payload.encuestador_id,
            exc_info=True,
        )
        raise HTTPException(status_code=500, detail="Error interno. Contacte soporte.")
