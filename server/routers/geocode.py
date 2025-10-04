"""
Geocoding service for place search functionality
"""
import os
import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from functools import lru_cache
import httpx
import asyncio

router = APIRouter()

# Configuration
NOMINATIM_BASE_URL = os.getenv("NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org")
NOMINATIM_USER_AGENT = os.getenv("NOMINATIM_USER_AGENT", "Civitas/1.0")

# In-memory cache for geocoding results
geocode_cache = {}

# Local Finnish cities fallback data
FINNISH_CITIES = [
    {"name": "Helsinki", "admin": "Uusimaa", "lat": 60.1699, "lon": 24.9384},
    {"name": "Espoo", "admin": "Uusimaa", "lat": 60.1699, "lon": 24.7384},
    {"name": "Tampere", "admin": "Pirkanmaa", "lat": 61.4991, "lon": 23.7871},
    {"name": "Vantaa", "admin": "Uusimaa", "lat": 60.2941, "lon": 25.0403},
    {"name": "Turku", "admin": "Varsinais-Suomi", "lat": 60.4518, "lon": 22.2666},
    {"name": "Oulu", "admin": "Pohjois-Pohjanmaa", "lat": 65.0121, "lon": 25.4651},
    {"name": "Lahti", "admin": "Päijät-Häme", "lat": 60.9827, "lon": 25.6612},
    {"name": "Kuopio", "admin": "Pohjois-Savo", "lat": 62.8924, "lon": 27.6770},
    {"name": "Jyväskylä", "admin": "Keski-Suomi", "lat": 62.2415, "lon": 25.7209},
    {"name": "Pori", "admin": "Satakunta", "lat": 61.4858, "lon": 21.7974},
    {"name": "Lappeenranta", "admin": "Etelä-Karjala", "lat": 61.0586, "lon": 28.1864},
    {"name": "Vaasa", "admin": "Pohjanmaa", "lat": 63.0960, "lon": 21.6158},
    {"name": "Joensuu", "admin": "Pohjois-Karjala", "lat": 62.6019, "lon": 29.7636},
    {"name": "Hämeenlinna", "admin": "Kanta-Häme", "lat": 61.0030, "lon": 24.4643},
    {"name": "Seinäjoki", "admin": "Etelä-Pohjanmaa", "lat": 62.7945, "lon": 22.8282},
    {"name": "Mikkeli", "admin": "Etelä-Savo", "lat": 61.6886, "lon": 27.2723},
    {"name": "Kotka", "admin": "Kymenlaakso", "lat": 60.4664, "lon": 26.9458},
    {"name": "Kouvola", "admin": "Kymenlaakso", "lat": 60.8686, "lon": 26.7047},
    {"name": "Imatra", "admin": "Etelä-Karjala", "lat": 61.1719, "lon": 28.7764},
    {"name": "Nokia", "admin": "Pirkanmaa", "lat": 61.4667, "lon": 23.5000},
    {"name": "Savonlinna", "admin": "Etelä-Savo", "lat": 61.8681, "lon": 28.8833},
    {"name": "Riihimäki", "admin": "Kanta-Häme", "lat": 60.7372, "lon": 24.7775},
    {"name": "Hyvinkää", "admin": "Uusimaa", "lat": 60.6331, "lon": 24.8631},
    {"name": "Kemi", "admin": "Lappi", "lat": 65.7364, "lon": 24.5639},
    {"name": "Kokkola", "admin": "Keski-Pohjanmaa", "lat": 63.8381, "lon": 23.1306},
    {"name": "Rovaniemi", "admin": "Lappi", "lat": 66.5031, "lon": 25.7289},
    {"name": "Tornio", "admin": "Lappi", "lat": 65.8481, "lon": 24.1467},
    {"name": "Salo", "admin": "Varsinais-Suomi", "lat": 60.3831, "lon": 23.1256},
    {"name": "Iisalmi", "admin": "Pohjois-Savo", "lat": 63.5614, "lon": 27.1875},
    {"name": "Kajaani", "admin": "Kainuu", "lat": 64.2250, "lon": 27.7283},
    {"name": "Forssa", "admin": "Kanta-Häme", "lat": 60.8142, "lon": 23.6217}
]

class GeocodeResult(BaseModel):
    display_name: str
    lat: float
    lon: float
    type: str
    confidence: float = 0.0

async def search_nominatim(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Search using Nominatim API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{NOMINATIM_BASE_URL}/search",
                params={
                    "q": query,
                    "format": "json",
                    "limit": limit,
                    "countrycodes": "fi",  # Focus on Finland
                    "addressdetails": 1,
                    "extratags": 1
                },
                headers={"User-Agent": NOMINATIM_USER_AGENT},
                timeout=10.0
            )
            
            if response.status_code == 200:
                results = response.json()
                return [
                    {
                        "display_name": result.get("display_name", ""),
                        "lat": float(result.get("lat", 0)),
                        "lon": float(result.get("lon", 0)),
                        "type": result.get("type", "unknown"),
                        "confidence": 0.8  # Nominatim results are generally reliable
                    }
                    for result in results
                ]
    except Exception as e:
        print(f"Nominatim search failed: {e}")
    
    return []

def search_local_gazetteer(query: str, limit: int = 5) -> List[Dict[str, Any]]:
    """Search local Finnish cities as fallback"""
    query_lower = query.lower()
    results = []
    
    for city in FINNISH_CITIES:
        if (query_lower in city["name"].lower() or 
            query_lower in city["admin"].lower()):
            results.append({
                "display_name": f"{city['name']}, {city['admin']}",
                "lat": city["lat"],
                "lon": city["lon"],
                "type": "city",
                "confidence": 0.6  # Lower confidence for local fallback
            })
    
    # Sort by relevance (exact matches first)
    results.sort(key=lambda x: (
        query_lower in x["display_name"].lower(),
        x["confidence"]
    ), reverse=True)
    
    return results[:limit]

@router.get("/geocode", response_model=List[GeocodeResult])
async def geocode_place(
    q: str = Query(..., description="Place name to search for"),
    limit: int = Query(5, ge=1, le=10, description="Maximum number of results")
):
    """
    Geocode a place name to get coordinates
    """
    if not q or len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Query must be at least 2 characters")
    
    # Check cache first
    cache_key = f"{q.lower()}:{limit}"
    if cache_key in geocode_cache:
        return geocode_cache[cache_key]
    
    results = []
    
    # Try Nominatim first
    nominatim_results = await search_nominatim(q, limit)
    if nominatim_results:
        results.extend(nominatim_results)
    
    # If we need more results or Nominatim failed, use local gazetteer
    if len(results) < limit:
        local_results = search_local_gazetteer(q, limit - len(results))
        results.extend(local_results)
    
    # Remove duplicates based on coordinates
    seen_coords = set()
    unique_results = []
    for result in results:
        coord_key = (round(result["lat"], 4), round(result["lon"], 4))
        if coord_key not in seen_coords:
            seen_coords.add(coord_key)
            unique_results.append(result)
    
    # Cache the results (simple LRU-like behavior)
    if len(geocode_cache) > 1000:  # Limit cache size
        geocode_cache.clear()
    
    geocode_cache[cache_key] = unique_results[:limit]
    
    return unique_results[:limit]

@router.get("/geocode/reverse")
async def reverse_geocode(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """
    Reverse geocode coordinates to get place name
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{NOMINATIM_BASE_URL}/reverse",
                params={
                    "lat": lat,
                    "lon": lon,
                    "format": "json",
                    "addressdetails": 1,
                    "zoom": 10
                },
                headers={"User-Agent": NOMINATIM_USER_AGENT},
                timeout=10.0
            )
            
            if response.status_code == 200:
                result = response.json()
                return {
                    "display_name": result.get("display_name", ""),
                    "lat": float(result.get("lat", lat)),
                    "lon": float(result.get("lon", lon)),
                    "address": result.get("address", {})
                }
    except Exception as e:
        print(f"Reverse geocoding failed: {e}")
    
    return {
        "display_name": f"Location ({lat:.4f}, {lon:.4f})",
        "lat": lat,
        "lon": lon,
        "address": {}
    }
