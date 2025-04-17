from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import Response, JSONResponse, HTMLResponse
import httpx
import os
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Get service URLs from environment variables with fallbacks
SERVICES = {
    "auth": os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001"),
    "book": os.getenv("BOOK_SERVICE_URL", "http://book-service:8002"),
    "cart": os.getenv("CART_SERVICE_URL", "http://cart-service:8003")
}

@router.api_route("/{service}/{path:path}", methods=["GET", "POST", "PATCH", "PUT", "DELETE"])
async def proxy_request(service: str, path: str, request: Request):
    if service not in SERVICES:
        raise HTTPException(status_code=400, detail="Invalid service")

    url = f"{SERVICES[service]}/{path}"
    headers = dict(request.headers)
    body = await request.body()
    params = dict(request.query_params)

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                params=params,
                content=body
            )
            
            # Get the content type from the response
            content_type = response.headers.get("content-type", "")
            
            # Handle different response types
            if "application/json" in content_type:
                return JSONResponse(content=response.json(), status_code=response.status_code)
            elif "text/html" in content_type:
                return HTMLResponse(content=response.text, status_code=response.status_code)
            else:
                # For any other content type, return the raw response
                return Response(
                    content=response.content,
                    status_code=response.status_code,
                    headers=dict(response.headers)
                )
    except httpx.RequestError as e:
        logger.error(f"Service {service} is unavailable: {str(e)}")
        raise HTTPException(status_code=503, detail=f"Service {service} is unavailable: {str(e)}")
    except Exception as e:
        logger.error(f"Error proxying request to {service}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error proxying request to {service}: {str(e)}")