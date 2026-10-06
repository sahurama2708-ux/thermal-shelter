import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.database import Base, engine
from app.routers import auth, health, predictions, users
from app.services.model import ArtifactLoadError, model_service
from app.utils.responses import error

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("shelter.main")

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables for local/SQLite dev; production should rely on Alembic.
    Base.metadata.create_all(bind=engine)

    logger.info("Loading ML artifacts...")
    try:
        model_service.load()
    except ArtifactLoadError as exc:
        logger.error("Startup failed: %s", exc)
        raise

    yield

    logger.info("Shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Backend inference and account service for the Thermal Comfort "
        "Shelter project. Predicts a local thermal condition from NASA "
        "POWER climatology and returns a shelter design recommendation."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS: never "*" with credentials enabled. Only the configured frontend origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    detail = exc.detail
    if isinstance(detail, dict) and "success" in detail:
        return JSONResponse(status_code=exc.status_code, content=detail)
    return JSONResponse(
        status_code=exc.status_code,
        content=error("HTTP_ERROR", str(detail)),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error("VALIDATION_ERROR", str(exc.errors())),
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error("INTERNAL_SERVER_ERROR", "An unexpected error occurred"),
    )


app.include_router(health.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(predictions.router)
