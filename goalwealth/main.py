from fastapi import FastAPI
from goalwealth.routers.main import router as main_router


app = FastAPI()
app.include_router(main_router)

@app.get("/")
async def root():

    return {"message": "Hello World"}
